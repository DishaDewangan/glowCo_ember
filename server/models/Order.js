import mongoose from 'mongoose';

const orderProductSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    amount: { type: Number, required: true },
    products: [orderProductSchema],
    channel: {
      type: String,
      enum: ['website', 'app', 'instagram'],
      required: true,
    },
    orderedAt: { type: Date, required: true },
  },
  { timestamps: true }
);

orderSchema.index({ customerId: 1 });
orderSchema.index({ orderedAt: 1 });

export default mongoose.model('Order', orderSchema);
