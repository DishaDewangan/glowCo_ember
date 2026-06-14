import { tool } from 'ai';
import { z } from 'zod';
import * as handlers from './toolHandlers.js';

export const agentTools = {
  segment_customers: tool({
    description:
      'Find customers matching behavioural or attribute criteria from the GlowCo database. Creates a named segment.',
    parameters: z.object({
      filterCriteria: z.object({
        last_order_days: z
          .object({ min: z.number().optional(), max: z.number().optional() })
          .optional(),
        total_orders: z
          .object({ min: z.number().optional(), max: z.number().optional() })
          .optional(),
        avg_spend: z
          .object({ min: z.number().optional(), max: z.number().optional() })
          .optional(),
        skin_type: z.union([z.string(), z.array(z.string())]).optional(),
        preferred_channel: z.enum(['whatsapp', 'sms', 'email', 'rcs']).optional(),
        cohort_date: z
          .object({ after: z.string().optional(), before: z.string().optional() })
          .optional(),
        routine_completeness_score: z
          .object({ min: z.number().optional(), max: z.number().optional() })
          .optional(),
        products_purchased_includes: z.array(z.string()).optional(),
        products_purchased_excludes: z.array(z.string()).optional(),
        city: z.union([z.string(), z.array(z.string())]).optional(),
      }),
      segmentName: z.string(),
      segmentDescription: z.string(),
    }),
    execute: handlers.segmentCustomers,
  }),

  draft_message: tool({
    description: 'Generate 2–3 personalised message variants for a customer segment.',
    parameters: z.object({
      segmentId: z.string(),
      campaignGoal: z.string(),
      tone: z.enum(['win-back', 'upsell', 'educational', 'promotional']).optional(),
    }),
    execute: handlers.draftMessage,
  }),

  launch_campaign: tool({
    description: 'Launch a campaign to a segment using a chosen message.',
    parameters: z.object({
      segmentId: z.string(),
      messageBody: z.string(),
      channel: z.enum(['whatsapp', 'sms', 'email', 'rcs']),
      campaignName: z.string(),
    }),
    execute: handlers.launchCampaignHandler,
  }),

  get_campaign_stats: tool({
    description: 'Get delivery and engagement metrics for a campaign.',
    parameters: z.object({
      campaignId: z.string(),
    }),
    execute: handlers.getCampaignStats,
  }),

  explain_audience: tool({
    description:
      'Return a plain-English profile of who is in a segment and why they were chosen.',
    parameters: z.object({
      segmentId: z.string(),
    }),
    execute: handlers.explainAudience,
  }),
};
