import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import Customer from '../models/Customer.js';
import Segment from '../models/Segment.js';
import Campaign from '../models/Campaign.js';
import { runSegmentQuery } from '../services/segmentEngine.js';
import { launchCampaign, computeRates } from '../services/campaignLauncher.js';

export async function segmentCustomers({ filterCriteria, segmentName, segmentDescription }) {
  const { customers, count } = await runSegmentQuery(filterCriteria);

  const segment = await Segment.create({
    name: segmentName,
    description: segmentDescription,
    filterCriteria,
    customerCount: count,
    createdBy: 'agent',
  });

  const channelBreakdown = {};
  const skinBreakdown = {};
  let totalSpend = 0;

  for (const c of customers) {
    channelBreakdown[c.preferredChannel] = (channelBreakdown[c.preferredChannel] || 0) + 1;
    skinBreakdown[c.skinType] = (skinBreakdown[c.skinType] || 0) + 1;
    totalSpend += c.avgSpend || 0;
  }

  const topChannel = Object.entries(channelBreakdown).sort((a, b) => b[1] - a[1])[0];

  return {
    segmentId: segment._id.toString(),
    segmentName,
    customerCount: count,
    avgSpend: count ? Math.round(totalSpend / count) : 0,
    topChannel: topChannel ? { channel: topChannel[0], percentage: Math.round((topChannel[1] / count) * 100) } : null,
    skinTypeBreakdown: skinBreakdown,
    channelBreakdown,
  };
}

export async function draftMessage({ segmentId, campaignGoal, tone = 'promotional' }) {
  const segment = await Segment.findById(segmentId);
  if (!segment) throw new Error('Segment not found');

  const mongoQuery = (await import('../services/segmentEngine.js')).buildSegmentQuery(
    segment.filterCriteria
  );
  const sampleCustomers = await Customer.find(mongoQuery).limit(50).lean();

  const skinTypes = {};
  const channels = {};
  const products = {};
  let totalSpend = 0;

  for (const c of sampleCustomers) {
    skinTypes[c.skinType] = (skinTypes[c.skinType] || 0) + 1;
    channels[c.preferredChannel] = (channels[c.preferredChannel] || 0) + 1;
    totalSpend += c.avgSpend || 0;
    for (const p of c.productsPurchased || []) {
      products[p] = (products[p] || 0) + 1;
    }
  }

  const audienceProfile = {
    count: segment.customerCount,
    dominantSkinTypes: Object.entries(skinTypes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([type]) => type),
    avgSpend: sampleCustomers.length ? Math.round(totalSpend / sampleCustomers.length) : 0,
    topProducts: Object.entries(products)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([p]) => p),
    channelPreference: Object.entries(channels)
      .sort((a, b) => b[1] - a[1])
      .map(([ch, count]) => ({
        channel: ch,
        percentage: Math.round((count / sampleCustomers.length) * 100),
      })),
  };

  const recommendedChannel = audienceProfile.channelPreference[0]?.channel || 'whatsapp';

  const templateVariants = () => ({
    variants: [
      {
        label: 'Draft A',
        message: `Hey [name], your GlowCo favourites are waiting 🌿 Reorder today and get free shipping: GLOW10`,
        channel: recommendedChannel,
      },
      {
        label: 'Draft B',
        message: `Hi [name], your skin routine shouldn't pause — reorder now and we'll add a free serum sample: REFILL`,
        channel: recommendedChannel,
      },
    ],
    recommendedChannel,
    reasoning: `${audienceProfile.channelPreference[0]?.percentage || 55}% of this audience prefers ${recommendedChannel}.`,
  });

  let variants;
  if (process.env.DEMO_MODE === 'true') {
    variants = templateVariants();
  } else {
    try {
      const result = await generateText({
        model: anthropic('claude-sonnet-4-20250514'),
        prompt: `You are writing campaign messages for GlowCo, an Indian D2C skincare brand.

Audience profile: ${JSON.stringify(audienceProfile)}
Campaign goal: ${campaignGoal}
Tone: ${tone}

Generate exactly 2 message variants for this audience. Each message should:
- Use [name] as placeholder for customer first name
- Be under 160 characters if possible (WhatsApp-friendly)
- Include a promo code relevant to the goal
- Feel personal, not generic

Return ONLY valid JSON in this format:
{
  "variants": [
    { "label": "Draft A", "message": "...", "channel": "${recommendedChannel}" },
    { "label": "Draft B", "message": "...", "channel": "${recommendedChannel}" }
  ],
  "recommendedChannel": "${recommendedChannel}",
  "reasoning": "brief explanation of channel choice"
}`,
      });

      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      variants = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      variants = null;
    }
  }

  if (!variants) {
    variants = templateVariants();
  }

  return {
    segmentId,
    campaignGoal,
    tone,
    audienceProfile,
    ...variants,
  };
}

export async function launchCampaignHandler({
  segmentId,
  messageBody,
  channel,
  campaignName,
}) {
  return launchCampaign({ segmentId, messageBody, channel, campaignName });
}

export async function getCampaignStats({ campaignId }) {
  const campaign = await Campaign.findById(campaignId).populate('segmentId');
  if (!campaign) throw new Error('Campaign not found');

  const stats = computeRates(campaign.stats.toObject ? campaign.stats.toObject() : campaign.stats);

  await Campaign.updateOne({ _id: campaignId }, { $set: { stats } });

  return {
    campaignId: campaign._id.toString(),
    campaignName: campaign.name,
    status: campaign.status,
    channel: campaign.channel,
    segmentName: campaign.segmentId?.name,
    launchedAt: campaign.launchedAt,
    stats,
    summary: `${stats.delivered} of ${stats.sent} delivered (${stats.deliveryRate}%), ${stats.opened} opened (${stats.openRate}% of delivered), ${stats.clicked} clicked (${stats.clickRate}% of opened).`,
  };
}

export async function explainAudience({ segmentId }) {
  const segment = await Segment.findById(segmentId);
  if (!segment) throw new Error('Segment not found');

  const mongoQuery = (await import('../services/segmentEngine.js')).buildSegmentQuery(
    segment.filterCriteria
  );
  const customers = await Customer.find(mongoQuery).lean();

  if (customers.length === 0) {
    return {
      segmentId,
      segmentName: segment.name,
      customerCount: 0,
      profile: 'No customers match this segment.',
    };
  }

  const skinTypes = {};
  const channels = {};
  const cities = {};
  let totalSpend = 0;
  let totalOrders = 0;
  const productCounts = {};

  for (const c of customers) {
    skinTypes[c.skinType] = (skinTypes[c.skinType] || 0) + 1;
    channels[c.preferredChannel] = (channels[c.preferredChannel] || 0) + 1;
    cities[c.city] = (cities[c.city] || 0) + 1;
    totalSpend += c.avgSpend || 0;
    totalOrders += c.totalOrders || 0;
    for (const p of c.productsPurchased || []) {
      productCounts[p] = (productCounts[p] || 0) + 1;
    }
  }

  const pct = (n) => Math.round((n / customers.length) * 100);
  const topSkin = Object.entries(skinTypes).sort((a, b) => b[1] - a[1])[0];
  const topChannel = Object.entries(channels).sort((a, b) => b[1] - a[1])[0];
  const topCity = Object.entries(cities).sort((a, b) => b[1] - a[1])[0];
  const topProducts = Object.entries(productCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([p, count]) => `${p} (${pct(count)}%)`);

  const profile = [
    `${customers.length} customers in "${segment.name}".`,
    `Skin type skews ${topSkin[0]} (${pct(topSkin[1])}%).`,
    `Average spend ₹${Math.round(totalSpend / customers.length)}, avg ${Math.round(totalOrders / customers.length)} orders.`,
    `Dominant channel: ${topChannel[0]} (${pct(topChannel[1])}%).`,
    `Top city: ${topCity[0]} (${pct(topCity[1])}%).`,
    topProducts.length ? `Most purchased: ${topProducts.join(', ')}.` : '',
    `Why selected: ${segment.description}`,
  ]
    .filter(Boolean)
    .join(' ');

  return {
    segmentId,
    segmentName: segment.name,
    customerCount: customers.length,
    profile,
    breakdown: {
      skinTypes: Object.fromEntries(
        Object.entries(skinTypes).map(([k, v]) => [k, pct(v)])
      ),
      channels: Object.fromEntries(
        Object.entries(channels).map(([k, v]) => [k, pct(v)])
      ),
      cities: Object.fromEntries(
        Object.entries(cities).map(([k, v]) => [k, pct(v)])
      ),
      avgSpend: Math.round(totalSpend / customers.length),
      avgOrders: Math.round((totalOrders / customers.length) * 10) / 10,
    },
  };
}
