import dotenv from 'dotenv';
dotenv.config();

const body = {
  messages: [{ role: 'user', content: 'Show me high-value loyalists with 5+ orders' }],
};

console.log('Fetching agent...');
const res = await fetch('http://localhost:3000/api/agent/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

console.log('Status:', res.status, res.headers.get('content-type'));

const reader = res.body.getReader();
const decoder = new TextDecoder();
let total = '';
let chunks = 0;

const timeout = setTimeout(() => {
  console.log('TIMEOUT after 10s, chunks:', chunks, 'total len:', total.length);
  process.exit(1);
}, 10000);

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const text = decoder.decode(value, { stream: true });
  total += text;
  chunks++;
  process.stdout.write('.');
}

clearTimeout(timeout);
console.log('\nDone. Chunks:', chunks, 'Total:', total.length);
console.log(total.slice(0, 500));
