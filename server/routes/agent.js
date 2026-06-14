import { Router } from 'express';
import { streamText, convertToCoreMessages, pipeDataStreamToResponse } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { agentTools } from '../agent/tools.js';
import { systemPrompt } from '../agent/systemPrompt.js';
import { runFallbackAgent } from '../agent/fallbackAgent.js';

const router = Router();
const useDemoMode = process.env.DEMO_MODE === 'true';

router.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages?.length) {
      return res.status(400).json({ error: 'messages array required' });
    }

    const lastUserMessage =
      [...messages].reverse().find((m) => m.role === 'user')?.content || '';

    const streamHeaders = {
      'Access-Control-Allow-Origin': process.env.CLIENT_URL || 'http://localhost:5173',
      'Access-Control-Allow-Credentials': 'true',
    };

    if (useDemoMode || !process.env.ANTHROPIC_API_KEY) {
      return pipeDataStreamToResponse(res, {
        headers: streamHeaders,
        execute: async (writer) => {
          await runFallbackAgent(lastUserMessage, writer);
        },
      });
    }

    try {
      const result = streamText({
        model: anthropic('claude-sonnet-4-20250514'),
        system: systemPrompt,
        messages: convertToCoreMessages(messages),
        tools: agentTools,
        maxSteps: 10,
        onError: ({ error }) => {
          console.error('Agent stream error:', error);
        },
      });

      return result.pipeDataStreamToResponse(res, {
        headers: streamHeaders,
        getErrorMessage: (error) => {
          console.error('Agent pipe error:', error);
          return error instanceof Error ? error.message : 'Agent error';
        },
      });
    } catch (streamErr) {
      if (
        streamErr.message?.includes('credit balance') ||
        streamErr.message?.includes('certificate')
      ) {
        return pipeDataStreamToResponse(res, {
          headers: streamHeaders,
          execute: async (writer) => {
            await runFallbackAgent(lastUserMessage, writer);
          },
        });
      }
      throw streamErr;
    }
  } catch (err) {
    console.error('Agent chat error:', err);

    if (err.message?.includes('credit balance') || err.message?.includes('certificate')) {
      return pipeDataStreamToResponse(res, {
        execute: async (writer) => {
          const lastUserMessage =
            [...req.body.messages].reverse().find((m) => m.role === 'user')?.content || '';
          await runFallbackAgent(lastUserMessage, writer);
        },
      });
    }

    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
});

export default router;
