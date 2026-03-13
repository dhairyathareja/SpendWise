import mongoose, { Schema } from "mongoose";

const instanceSchema = new Schema(
{
  instanceId: {
    type: String,
    required: true
  },
  avgCpu: {
    type: Number,
    required: true
  }
},
{ _id: false }
);

const volumeSchema = new Schema(
{
  volumeId: {
    type: String,
    required: true
  },
  readOps: {
    type: Number,
    required: true
  }
},
{ _id: false }
);

const regionSchema = new Schema(
{
  region: {
    type: String,
    required: true
  },
  instances: [instanceSchema],
  volumes: [volumeSchema]
},
{ _id: false }
);

const s3Schema = new Schema(
{
  bucket: {
    type: String,
    required: true
  },
  empty: {
    type: Boolean,
    required: true
  }
},
{ _id: false }
);

const reportSchema = new Schema(
{
    scanDate: {
      type: Date,
      required: true
    },
    scanDuration: {
      type: Number,
      required: true
    },
    regions: [regionSchema],
    s3: [s3Schema]
},
{
  timestamps: true
}
);


const Reports = mongoose.model('Reports',reportSchema);

export default Reports