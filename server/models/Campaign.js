import mongoose from 'mongoose';

const campaignStatsSchema = new mongoose.Schema(
  {
    sent: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    opened: { type: Number, default: 0 },
    clicked: { type: Number, default: 0 },
    converted: { type: Number, default: 0 },
    deliveryRate: { type: Number, default: 0 },
    openRate: { type: Number, default: 0 },
    clickRate: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
  },
  { _id: false }
);

const campaignSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    segmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Segment', required: true },
    messageBody: { type: String, required: true },
    channel: {
      type: String,
      enum: ['whatsapp', 'sms', 'email', 'rcs'],
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'launching', 'live', 'complete'],
      default: 'draft',
    },
    launchedAt: { type: Date },
    stats: { type: campaignStatsSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export default mongoose.model('Campaign', campaignSchema);
