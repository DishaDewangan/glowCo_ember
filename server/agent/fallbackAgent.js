import { formatDataStreamPart } from 'ai';
import * as handlers from './toolHandlers.js';

function streamText(writer, text) {
  const words = text.split(/(\s+)/);
  for (const chunk of words) {
    if (chunk) writer.write(formatDataStreamPart('text', chunk));
  }
}

async function streamTool(writer, toolName, args, execute) {
  const toolCallId = `fallback-${Date.now()}-${toolName}`;
  writer.write(
    formatDataStreamPart('tool_call', {
      toolCallId,
      toolName,
      args,
    })
  );
  const result = await execute();
  writer.write(
    formatDataStreamPart('tool_result', {
      toolCallId,
      toolName,
      result,
    })
  );
  return result;
}

export async function runFallbackAgent(userMessage, writer) {
  const msg = userMessage.toLowerCase();

  if (msg.includes('stat') || msg.includes('perform') || msg.includes('how did')) {
    const Campaign = (await import('../models/Campaign.js')).default;
    const latest = await Campaign.findOne().sort({ createdAt: -1 });
    if (!latest) {
      streamText(
        writer,
        "No campaigns launched yet. Try asking me to find a segment and send a message first — e.g. 'Find customers whose moisturiser ran out 35+ days ago.'"
      );
      return;
    }
    const stats = await streamTool(
      writer,
      'get_campaign_stats',
      { campaignId: latest._id.toString() },
      () => handlers.getCampaignStats({ campaignId: latest._id.toString() })
    );
    streamText(
      writer,
      `\n\n**${stats.campaignName}** (${stats.channel})\n${stats.summary}\n\nOpen rate is calculated against delivered messages, not sent.`
    );
    return;
  }

  if (
    msg.includes('send') ||
    msg.includes('launch') ||
    msg.includes('draft a') ||
    msg.includes('draft b')
  ) {
    const Segment = (await import('../models/Segment.js')).default;
    const latestSeg = await Segment.findOne({ createdBy: 'agent' }).sort({ createdAt: -1 });
    if (!latestSeg) {
      streamText(writer, 'No segment found yet. Ask me to find an audience first.');
      return;
    }

    const messageBody =
      msg.includes('draft b') || msg.includes('second')
        ? "Hi [name], running low on your Daily Moisturiser? Your skin routine shouldn't pause — reorder now and we'll throw in a free serum sample: REFILL"
        : "Hey [name], your Daily Moisturiser should be wrapping up by now 🌿 Ready for your next one? Reorder today and get free shipping: GLOW10";

    const launch = await streamTool(
      writer,
      'launch_campaign',
      {
        segmentId: latestSeg._id.toString(),
        messageBody,
        channel: 'whatsapp',
        campaignName: `${latestSeg.name} campaign`,
      },
      () =>
        handlers.launchCampaignHandler({
          segmentId: latestSeg._id.toString(),
          messageBody,
          channel: 'whatsapp',
          campaignName: `${latestSeg.name} campaign`,
        })
    );

    streamText(
      writer,
      `\n\nLaunched to **${launch.recipientCount}** recipients over WhatsApp. Switch to the Analytics tab — delivery stats will populate live as messages are processed.`
    );
    return;
  }

  let filterCriteria;
  let segmentName;
  let segmentDescription;
  let campaignGoal;
  let tone = 'promotional';

  if (msg.includes('dry') && msg.includes('serum')) {
    filterCriteria = { skin_type: 'dry', products_purchased_excludes: ['serum'] };
    segmentName = 'dry_skin_no_serum';
    segmentDescription = 'Dry skin customers who have never purchased serum';
    campaignGoal = 'Upsell Hydra-Repair Serum to dry skin customers';
    tone = 'upsell';
  } else if (msg.includes('sunscreen') || msg.includes('moisturiser')) {
    if (msg.includes('sunscreen') && (msg.includes('gap') || msg.includes('never'))) {
      filterCriteria = {
        products_purchased_includes: ['moisturiser'],
        products_purchased_excludes: ['sunscreen'],
      };
      segmentName = 'sunscreen_gap';
      segmentDescription = 'Customers who bought moisturiser but never sunscreen';
      campaignGoal = 'Close the sunscreen gap in their skincare routine';
    } else {
      filterCriteria = {
        products_purchased_includes: ['moisturiser'],
        last_order_days: { min: 35, max: 180 },
      };
      segmentName = 'moisturiser_reorder';
      segmentDescription = 'Bought moisturiser 35+ days ago, likely running out';
      campaignGoal = 'Win back customers whose moisturiser should have run out';
      tone = 'win-back';
    }
  } else if (msg.includes('loyalist') || msg.includes('high-value') || msg.includes('5+')) {
    filterCriteria = { total_orders: { min: 5 }, avg_spend: { min: 900 } };
    segmentName = 'high_value_loyalists';
    segmentDescription = 'Customers with 5+ orders and average spend above ₹900';
    campaignGoal = 'Reward and retain high-value loyal customers';
  } else {
    filterCriteria = { total_orders: { min: 2 }, last_order_days: { min: 45, max: 90 } };
    segmentName = 'lapsed_reorderers';
    segmentDescription = 'Repeat buyers who have not ordered recently';
    campaignGoal = 'Win back lapsed customers';
    tone = 'win-back';
  }

  const seg = await streamTool(
    writer,
    'segment_customers',
    { filterCriteria, segmentName, segmentDescription },
    () => handlers.segmentCustomers({ filterCriteria, segmentName, segmentDescription })
  );

  const explain = await streamTool(
    writer,
    'explain_audience',
    { segmentId: seg.segmentId },
    () => handlers.explainAudience({ segmentId: seg.segmentId })
  );

  const drafts = await streamTool(
    writer,
    'draft_message',
    { segmentId: seg.segmentId, campaignGoal, tone },
    () => handlers.draftMessage({ segmentId: seg.segmentId, campaignGoal, tone })
  );

  const channel = drafts.recommendedChannel || seg.topChannel?.channel || 'whatsapp';
  const variants = drafts.variants || [];

  let response = `\n\nI found **${seg.customerCount} customers** in "${segmentName}".\n\n`;
  response += `${explain.profile}\n\n`;
  response += `**${channel}** is the best channel (${seg.topChannel?.percentage || 55}% prefer it).\n\n`;

  if (variants.length) {
    response += 'Here are two message drafts:\n\n';
    variants.forEach((v) => {
      response += `**${v.label}:** "${v.message}"\n\n`;
    });
    response += 'Which would you like to send? Say "Send draft A" to launch.';
  }

  streamText(writer, response);
}
