import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    preferredChannel: {
      type: String,
      enum: ['whatsapp', 'sms', 'email', 'rcs'],
      required: true,
    },
    city: { type: String, required: true },
    skinType: {
      type: String,
      enum: ['oily', 'dry', 'combination', 'sensitive', 'normal'],
      required: true,
    },
    cohortDate: { type: Date, required: true },
    totalOrders: { type: Number, default: 0 },
    avgSpend: { type: Number, default: 0 },
    lastOrderDate: { type: Date },
    productsPurchased: [{ type: String }],
    routineCompletenessScore: { type: Number, default: 0, min: 0, max: 5 },
  },
  { timestamps: true }
);

customerSchema.index({ lastOrderDate: 1 });
customerSchema.index({ totalOrders: 1 });
customerSchema.index({ skinType: 1 });
customerSchema.index({ productsPurchased: 1 });

export default mongoose.model('Customer', customerSchema);
