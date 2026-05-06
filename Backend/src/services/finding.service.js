import ErrorHandler from "../utils/ErrorHandler.js";
import ErrorWrapper from "../utils/ErrorWrapper.js";
import Findings from "../model/finding.model.js";

export const generateFindings =  (report, scanId) => {
  const findings = [];

  report.regions.forEach(region => {
    const regionName = region.region;

    // EC2
    region.instances.forEach(instance => {
      if (instance.avgCpu < 5) {
        findings.push({
          scanId,
          resourceType: "EC2",
          resourceId: instance.instanceId,
          region: regionName,
          issue: "Idle Instance",
          severity: "HIGH",
          category: "COST",
          metadata: { avgCpu: instance.avgCpu }
        });
      } else if (instance.avgCpu > 80) {
        findings.push({
          scanId,
          resourceType: "EC2",
          resourceId: instance.instanceId,
          region: regionName,
          issue: "High CPU Utilization",
          severity: "CRITICAL",
          category: "PERFORMANCE",
          metadata: { avgCpu: instance.avgCpu }
        });
      }
    });

    // EBS
    region.volumes.forEach(volume => {
      if (volume.readOps < 100) {
        findings.push({
          scanId,
          resourceType: "EBS",
          resourceId: volume.volumeId,
          region: regionName,
          issue: "Low Activity Volume",
          severity: "MEDIUM",
          category: "COST",
          metadata: { readOps: volume.readOps }
        });
      } else if (volume.readOps > 20000) {
        findings.push({
          scanId,
          resourceType: "EBS",
          resourceId: volume.volumeId,
          region: regionName,
          issue: "High Disk Usage",
          severity: "CRITICAL",
          category: "PERFORMANCE",
          metadata: { readOps: volume.readOps }
        });
      }
    });
  });

  // S3
  report.s3.forEach(bucket => {
    if (bucket.empty) {
      findings.push({
        scanId,
        resourceType: "S3",
        resourceId: bucket.bucket,
        region: "global",
        issue: "Empty Bucket",
        severity: "LOW",
        category: "COST",
        metadata: { empty: true }
      });
    }
  });

  return findings;
};



export const saveFindings = ErrorWrapper(async (findings) => {
  try {
    // 1️⃣ Safety check
    if (!findings || findings.length === 0) {
      return [];
    }

    // 2️⃣ Insert all findings in one go (FAST ⚡)
    const savedFindings = await Findings.insertMany(findings);

    return savedFindings;

  } catch (error) {
    throw new ErrorHandler(501,error.message); 
  }
});