import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ['cleanser', 'serum', 'moisturiser', 'sunscreen', 'mask'],
      required: true,
    },
    avgReorderDays: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);
