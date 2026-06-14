import dotenv from 'dotenv';
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

dotenv.config();

try {
  const result = await generateText({
    model: anthropic('claude-sonnet-4-20250514'),
    prompt: 'Reply with exactly: API OK',
    maxTokens: 10,
  });
  console.log('API test passed:', result.text.trim());
  process.exit(0);
} catch (err) {
  console.error('API test failed:', err.message);
  process.exit(1);
}
