import {
  EC2Client,
  DescribeRegionsCommand,
  DescribeInstancesCommand,
  DescribeVolumesCommand,
} from "@aws-sdk/client-ec2";
import {
  CloudWatchClient,
  GetMetricDataCommand,
} from "@aws-sdk/client-cloudwatch";
import {
  S3Client,
  ListBucketsCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import ErrorWrapper from "../utils/ErrorWrapper.js";
import { assumeClientRole } from "../utils/ClientRole.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import Reports from "../model/reports.model.js";
import Accounts from "../model/cloudAccounts.model.js";
import { generateFindings, saveFindings } from "../services/finding.service.js";
import { processRecommendations } from "../services/jobs/processRecommendations.js";

// Supporting Functions

async function scanRegion(region, credentials) {
  const ec2 = new EC2Client({ region, credentials });
  const cloudwatch = new CloudWatchClient({ region, credentials });

  const instanceData = await ec2.send(new DescribeInstancesCommand({}));
  const volumeData = await ec2.send(new DescribeVolumesCommand({}));

  const instances = [];
  instanceData.Reservations.forEach((r) => {
    r.Instances.forEach((i) => {
      instances.push(i.InstanceId);
    });
  });

  const volumes = volumeData.Volumes.map((v) => v.VolumeId);

  const metricQueries = [
    ...instances.map((id, i) => ({
      Id: `cpu${i}`,
      MetricStat: {
        Metric: {
          Namespace: "AWS/EC2",
          MetricName: "CPUUtilization",
          Dimensions: [{ Name: "InstanceId", Value: id }],
        },
        Period: 86400,
        Stat: "Average",
      },
    })),
    ...volumes.map((id, i) => ({
      Id: `vol${i}`,
      MetricStat: {
        Metric: {
          Namespace: "AWS/EBS",
          MetricName: "VolumeReadOps",
          Dimensions: [{ Name: "VolumeId", Value: id }],
        },
        Period: 86400,
        Stat: "Sum",
      },
    })),
  ];

  const end = new Date();
  const start = new Date();
  start.setHours(end.getHours() - 24);

  if (metricQueries.length === 0) {
    return {
      region,
      instances,
      volumes,
      metrics: [],
    };
  }

  const batchSize = 500;
  let allMetrics = [];

  for (let i = 0; i < metricQueries.length; i += batchSize) {
    const queries = metricQueries.slice(i, i + batchSize);

    const result = await cloudwatch.send(
      new GetMetricDataCommand({
        StartTime: start,
        EndTime: end,
        MetricDataQueries: queries,
      }),
    );

    allMetrics.push(...result.MetricDataResults);
  }

  const instanceMetrics = instances
    .map((instanceId, index) => {
      const metric = allMetrics.find((m) => m.Id === `cpu${index}`);

      return {
        instanceId,
        avgCpu: Number(metric?.Values?.[0]?.toFixed(2)),
      };
    })
    .filter((i) => i.avgCpu !== null);

  const volumeMetrics = volumes.map((volumeId, index) => {
    const metric = allMetrics.find((m) => m.Id === `vol${index}`);

    return {
      volumeId,
      readOps: metric?.Values?.[0] ?? 0,
    };
  });

  return {
    region,
    instances: instanceMetrics,
    volumes: volumeMetrics,
  };
}

async function getBuckets(s3) {
  const data = await s3.send(new ListBucketsCommand({}));

  return data.Buckets.map((b) => b.Name);
}

async function checkBucketEmpty(s3, bucketName) {
  try {
    const objects = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        MaxKeys: 1,
      }),
    );

    return {
      bucket: bucketName,
      empty: objects.KeyCount === 0,
    };
  } catch (error) {
    return {
      bucket: bucketName,
      empty: null,
      error: error.message,
    };
  }
}

async function scanS3(credentials) {
  const s3 = new S3Client({
    region: "ap-south-1",
    credentials,
  });

  const buckets = await getBuckets(s3);

  if (buckets.length === 0) {
    return [];
  }

  const results = await Promise.all(
    buckets.map((bucket) => checkBucketEmpty(s3, bucket)),
  );

  return results;
}

// API Controller

export const scanAccount = ErrorWrapper(async (req, res, next) => {
  const { roleArn, email } = req.body;

  const scanStart = Date.now();

  const creds = await assumeClientRole(roleArn);

  let newScanId = "";

  try {
    const ec2Global = new EC2Client({ region: "ap-south-1", creds });

    const regionsData = await ec2Global.send(new DescribeRegionsCommand({}));
    const regions = regionsData.Regions.map((r) => r.RegionName);

    const regionResults = await Promise.all(
      regions.map((region) => scanRegion(region, creds)),
    );

    const filteredRegions = regionResults.filter(
      (r) => r.instances.length > 0 || r.volumes.length > 0,
    );

    const s3Data = await scanS3(creds);

    const scanEnd = Date.now();
    const scanDuration = (scanEnd - scanStart) / 1000;

    const report = {
      scanDate: new Date().toISOString(),
      scanDuration: Number(scanDuration.toFixed(2)),
      regions: filteredRegions,
      s3: s3Data,
    };

    try {
      const newScan = await Reports.create(report);

      newScanId = newScan._id;

      await Accounts.updateOne(
        { roleArn: roleArn },
        {
          $push: {
            scanHistory: {
              scanId: newScan._id,
              scanDate: newScan.scanDate,
            },
          },
        },
      );
    } catch (error) {
      throw new ErrorHandler(401, error.message); //`Error in Saving Report`
    }

    setImmediate(async () => {
      try {
        const findings = generateFindings(report, newScanId);

        await saveFindings(findings);

        processRecommendations(newScanId, email);
      } catch (err) {
        console.error("Background scan pipeline error:", err.message);
      }
    });

    res.status(200).json({
      success: true,
      message: "Scan Successfull",
      report: report,
    });
  } catch (error) {
    throw new ErrorHandler(401, error.message); //`Error in Generating Report`
  }
});

export const latestScans = ErrorWrapper(async (req, res, next) => {
  try {
    const { roleArn } = req.body;

    const scans = await Accounts.aggregate([
      { $match: { roleArn } },
      { $unwind: "$scanHistory" },
      { $sort: { "scanHistory.scanDate": -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          scanId: "$scanHistory.scanId",
          scanDate: "$scanHistory.scanDate",
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Latest Scan Fetched Successfully",
      scanList: scans,
    });
  } catch (error) {
    throw new ErrorHandler(401, `Error in fetching latest scans`);
  }
});
