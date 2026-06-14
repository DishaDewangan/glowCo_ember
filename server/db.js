import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/glowco-ember';
  await mongoose.connect(uri);
  console.log('MongoDB connected');
}

export default mongoose;
