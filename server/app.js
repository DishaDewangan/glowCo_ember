import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import agentRoutes from './routes/agent.js';
import ingestRoutes from './routes/ingest.js';
import campaignRoutes from './routes/campaigns.js';
import receiptRoutes from './routes/receipts.js';
import analyticsRoutes from './routes/analytics.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        /\.vercel\.app$/.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'glowco-ember-crm' });
});

app.use('/api/agent', agentRoutes);
app.use('/api/customers', ingestRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/', receiptRoutes);

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`CRM service running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start CRM:', err);
  process.exit(1);
});
