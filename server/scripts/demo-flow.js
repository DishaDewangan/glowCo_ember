import dotenv from 'dotenv';
dotenv.config();

const API = 'http://localhost:3000';

async function chat(content) {
  const res = await fetch(`${API}/api/agent/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content }] }),
  });
  const text = await res.text();
  return { ok: res.ok, len: text.length };
}

console.log('1. Segment query...');
const seg = await chat('Show me high-value loyalists with 5+ orders');
console.log('   ', seg.ok ? `OK (${seg.len} bytes)` : 'FAILED');

console.log('2. Launch campaign...');
const launch = await chat('Send draft A');
console.log('   ', launch.ok ? `OK (${launch.len} bytes)` : 'FAILED');

console.log('3. Waiting 8s for stub callbacks...');
await new Promise((r) => setTimeout(r, 8000));

const analytics = await fetch(`${API}/api/analytics/overview`).then((r) => r.json());
console.log('4. Analytics:', analytics.length, 'campaign(s)');
if (analytics[0]) {
  const s = analytics[0].stats;
  console.log('   ', analytics[0].name);
  console.log('   ', `sent=${s.sent} delivered=${s.delivered} opened=${s.opened} failed=${s.failed}`);
}
console.log('\nDemo flow complete.');
