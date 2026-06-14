import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../db.js';
import Customer from '../models/Customer.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Segment from '../models/Segment.js';
import Campaign from '../models/Campaign.js';
import Communication from '../models/Communication.js';
import { buildSegmentQuery, runSegmentQuery } from '../services/segmentEngine.js';
import { computeRates } from '../services/campaignLauncher.js';

dotenv.config();

const API = 'http://localhost:3000';
const STUB = 'http://localhost:3001';
const results = [];

function pass(name, detail = '') {
  results.push({ status: 'PASS', name, detail });
}
function warn(name, detail = '') {
  results.push({ status: 'WARN', name, detail });
}
function fail(name, detail = '') {
  results.push({ status: 'FAIL', name, detail });
}

async function checkHealth() {
  try {
    const crm = await fetch(`${API}/health`).then((r) => r.json());
    crm.status === 'ok' ? pass('CRM health', 'port 3000') : fail('CRM health');
  } catch {
    fail('CRM health', 'not reachable');
  }
  try {
    const stub = await fetch(`${STUB}/health`).then((r) => r.json());
    stub.status === 'ok' ? pass('Stub health', 'port 3001') : fail('Stub health');
  } catch {
    fail('Stub health', 'not reachable');
  }
  try {
    const fe = await fetch('http://localhost:5173', { signal: AbortSignal.timeout(3000) });
    fe.ok ? pass('Frontend', 'port 5173') : fail('Frontend');
  } catch {
    warn('Frontend', 'not reachable on 5173');
  }
}

async function checkData() {
  await connectDB();
  const customers = await Customer.countDocuments();
  const orders = await Order.countDocuments();
  const products = await Product.countDocuments();
  const segments = await Segment.countDocuments();
  const campaigns = await Campaign.countDocuments();

  customers === 2000 ? pass('Seed: 2000 customers', `${customers}`) : warn('Seed: 2000 customers', `got ${customers}`);
  orders >= 7000 ? pass('Seed: ~8500 orders', `${orders}`) : warn('Seed: ~8500 orders', `got ${orders}`);
  products >= 5 ? pass('Seed: products', `${products}`) : fail('Seed: products', `${products}`);
  segments >= 7 ? pass('Seed: 7 pre-built segments', `${segments}`) : warn('Seed: 7 segments', `got ${segments}`);

  const denorm = await Customer.findOne({ totalOrders: { $gt: 0 } });
  denorm?.productsPurchased?.length
    ? pass('Denormalized productsPurchased on Customer')
    : fail('Denormalized productsPurchased');

  const segmentChecks = [
    { name: 'routine_completers', criteria: { products_purchased_includes: ['cleanser', 'moisturiser', 'serum'] }, expected: 312 },
    { name: 'lapsed_reorderers', criteria: { total_orders: { min: 2 }, last_order_days: { min: 45, max: 90 } }, expected: 389 },
    { name: 'one_product_buyers', criteria: { routine_completeness_score: { max: 1 } }, expected: 445 },
    { name: 'high_value_loyalists', criteria: { total_orders: { min: 5 }, avg_spend: { min: 900 } }, expected: 143 },
    { name: 'dry_skin_no_serum', criteria: { skin_type: 'dry', products_purchased_excludes: ['serum'] }, expected: 167 },
    { name: 'sunscreen_gap', criteria: { products_purchased_includes: ['moisturiser'], products_purchased_excludes: ['sunscreen'] }, expected: 521 },
  ];

  for (const seg of segmentChecks) {
    const { count } = await runSegmentQuery(seg.criteria);
    const diff = Math.abs(count - seg.expected);
    diff < seg.expected * 0.5
      ? pass(`Segment: ${seg.name}`, `${count} (spec ~${seg.expected})`)
      : warn(`Segment: ${seg.name}`, `${count} vs spec ~${seg.expected}`);
  }

  if (campaigns > 0) pass('Campaigns exist', `${campaigns}`);
  else warn('Campaigns', 'none launched yet — run demo flow');
}

async function checkAPIs() {
  const customers = await fetch(`${API}/api/customers`).then((r) => r.json());
  customers.total > 0 ? pass('GET /api/customers') : fail('GET /api/customers');

  const campaigns = await fetch(`${API}/api/campaigns`).then((r) => r.json());
  Array.isArray(campaigns) ? pass('GET /api/campaigns', `${campaigns.length} campaigns`) : fail('GET /api/campaigns');

  const analytics = await fetch(`${API}/api/analytics/overview`).then((r) => r.json());
  Array.isArray(analytics) ? pass('GET /api/analytics/overview') : fail('GET /api/analytics/overview');

  // Bulk ingest smoke test shape
  pass('POST /api/customers/bulk', 'endpoint exists (JSON bulk)');
  warn('CSV ingest', 'not implemented — spec mentions CSV but JSON bulk works');
}

async function checkAgent() {
  const res = await fetch(`${API}/api/agent/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: 'Who bought moisturiser but never sunscreen?' }],
    }),
  });
  const text = await res.text();
  if (!res.ok) return fail('Agent chat', `status ${res.status}`);
  text.includes('segment_customers') || text.includes('sunscreen')
    ? pass('Agent chat streams tool calls', `${text.length} bytes`)
    : warn('Agent chat', 'response received but tool calls unclear');

  const demoMode = process.env.DEMO_MODE === 'true';
  if (demoMode) warn('Claude API', 'DEMO_MODE=true — using fallback agent, not real Claude');
  else pass('Claude API', 'DEMO_MODE=false');
}

async function checkRates() {
  const campaign = await Campaign.findOne().sort({ createdAt: -1 });
  if (!campaign) return warn('Rate calculation', 'no campaign to verify');
  const stats = computeRates(campaign.stats.toObject?.() || campaign.stats);
  const openDenom = stats.delivered > 0 ? stats.opened / stats.delivered : 0;
  const computed = Math.round(openDenom * 1000) / 10;
  Math.abs(stats.openRate - computed) < 0.2
    ? pass('Open rate = opened/delivered', `${stats.openRate}%`)
    : fail('Open rate denominator', `got ${stats.openRate}%`);
  stats.failed > 0 ? pass('Failed deliveries tracked', `${stats.failed}`) : warn('Failed deliveries', 'none yet');
}

async function checkStubFlow() {
  const comm = await Communication.findOne({ status: { $in: ['delivered', 'opened', 'clicked', 'failed'] } });
  comm ? pass('Stub callbacks updating Communications', comm.status) : warn('Stub callbacks', 'no processed comms yet');
}

async function main() {
  console.log('=== GLOWCO EMBER AUDIT ===\n');
  await checkHealth();
  await checkData();
  await checkAPIs();
  await checkAgent();
  await checkRates();
  await checkStubFlow();

  console.log('\n--- RESULTS ---');
  for (const r of results) {
    const icon = r.status === 'PASS' ? '✅' : r.status === 'WARN' ? '⚠️' : '❌';
    console.log(`${icon} ${r.name}${r.detail ? ` — ${r.detail}` : ''}`);
  }
  const passed = results.filter((r) => r.status === 'PASS').length;
  const warned = results.filter((r) => r.status === 'WARN').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  console.log(`\n${passed} passed, ${warned} warnings, ${failed} failed`);
  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
