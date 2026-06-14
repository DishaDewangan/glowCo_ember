import mongoose from 'mongoose';

const segmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    filterCriteria: { type: mongoose.Schema.Types.Mixed, required: true },
    customerCount: { type: Number, required: true },
    createdBy: {
      type: String,
      enum: ['agent', 'human'],
      default: 'agent',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Segment', segmentSchema);
