// ₹ per month
const EC2_PRICING = {
  "t2.micro": 600,
  "t3.small": 1200,
  "t3.medium": 2400,
  "t3.large": 4800
};

// ₹ per GB/month
const EBS_COST_PER_GB = 6;
const S3_COST_DIFF_PER_GB = 1.9;

export const calculateEC2Savings = (currentType, suggestedType) => {
  const current = EC2_PRICING[currentType];
  const next = EC2_PRICING[suggestedType];

  if (!current || !next) return null;

  const diff = current - next;

  return diff > 0
    ? `₹${diff}/month saved`
    : `+₹${Math.abs(diff)}/month increase`;
};

export const calculateEBSSavings = (sizeGB) => {
  return `₹${sizeGB * 2}/month saved`;
};

export const calculateS3Savings = (sizeGB) => {
  return `₹${Math.abs(sizeGB * S3_COST_DIFF_PER_GB)}/month saved`;
};