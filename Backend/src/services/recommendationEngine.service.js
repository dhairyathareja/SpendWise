import {
  calculateEC2Savings,
  calculateEBSSavings,
  calculateS3Savings,
} from "../utils/pricing.js";

export const generateRecommendation = (finding) => {
  const { resourceType, issue, metadata, resourceId, severity } = finding;

  let rec = null;

  // ===== EC2 =====
  if (resourceType === "EC2") {
    const cpu = metadata?.avgCpu;

    if (issue === "High CPU Utilization") {
      rec = {
        action: "Upgrade EC2 instance",
        suggestedType: cpu > 85 ? "t3.large" : "t3.medium",
        message: `CPU usage is ${cpu}%`,
        estimatedSavings: "Improves performance",
      };
    }

    if (issue === "Low CPU Utilization") {
      rec = {
        action: "Downgrade EC2 instance",
        suggestedType: cpu < 10 ? "t2.micro" : "t3.small",
        message: `CPU usage is low (${cpu}%)`,
        estimatedSavings: "Up to 40% cost saving",
      };
    }

    if (resourceType === "EC2" && issue === "Idle Instance") {
      rec = {
        action: "Stop or terminate idle instance",
        suggestedType: "t2.micro", 
        message: `Instance is idle (CPU: ${metadata?.avgCpu}%)`,
        estimatedSavings: "Save up to 100% cost",
      };
    }
  }

  // ===== EBS =====
  if (resourceType === "EBS") {
    const size = metadata?.sizeGB || 100;

    rec = {
      action: "Optimize EBS (reduce size or switch gp2 → gp3)",
      message: `Disk activity: ${metadata?.readOps}`,
      estimatedSavings: calculateEBSSavings(size),
    };
  }

  // ===== S3 =====
  if (resourceType === "S3") {
    const size = metadata?.sizeGB || 500;

    if (issue === "Empty Bucket") {
      rec = {
        action: "Delete unused bucket",
        message: "Bucket is empty",
        estimatedSavings: "Clean unused resources",
      };
    } else {
      rec = {
        action: "Apply lifecycle / move to Glacier",
        message: "Storage optimization possible",
        estimatedSavings: calculateS3Savings(size),
      };
    }
  }

  return rec
    ? {
        resourceId,
        resourceType,
        issue,
        severity,
        ...rec,
      }
    : null;
};
