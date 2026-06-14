import mongoose from 'mongoose';

const communicationSchema = new mongoose.Schema(
  {
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    channel: {
      type: String,
      enum: ['whatsapp', 'sms', 'email', 'rcs'],
      required: true,
    },
    messageBody: { type: String, required: true },
    status: {
      type: String,
      enum: ['queued', 'sent', 'delivered', 'failed', 'opened', 'clicked'],
      default: 'queued',
    },
    stubMessageId: { type: String, required: true },
    sentAt: { type: Date },
    deliveredAt: { type: Date },
    openedAt: { type: Date },
    clickedAt: { type: Date },
  },
  { timestamps: true }
);

communicationSchema.index({ stubMessageId: 1 }, { unique: true });
communicationSchema.index({ campaignId: 1 });

export default mongoose.model('Communication', communicationSchema);
