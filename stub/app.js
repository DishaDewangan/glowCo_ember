import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sendRoutes from './routes/send.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'glowco-ember-stub' });
});

app.use('/stub', sendRoutes);

app.listen(PORT, () => {
  console.log(`Stub service running on port ${PORT}`);
  console.log(`Callbacks → ${process.env.CRM_CALLBACK_URL || 'http://localhost:3000'}/crm/receipts`);
});
