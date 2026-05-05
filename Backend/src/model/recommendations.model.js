import mongoose, { Schema } from "mongoose";


const recommendationSchema = new mongoose.Schema({
  scanId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  resourceId: String,
  resourceType: String,
  issue: String,
  severity: String,

  action: String,
  message: String,

  suggestedType: String, // EC2
  performanceRisk: String,

  estimatedSavings: String,

  notified: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

const Recommendation = mongoose.model("Recommendation",recommendationSchema);
export default Recommendation;