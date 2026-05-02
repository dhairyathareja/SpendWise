import mongoose, { Schema } from "mongoose";

const findingSchema = new Schema({
  scanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Scan",
  },
  resourceType: String,   // EC2, EBS, S3
  resourceId: String,
  region: String,

  issue: String,          // "Idle Instance"
  severity: String,       // HIGH, MEDIUM, LOW

  metadata: Object,       // { avgCpu: 0, readOps: 50 }

  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const Findings = mongoose.model("Findings", findingSchema);
export default Findings;