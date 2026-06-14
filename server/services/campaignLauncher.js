import { v4 as uuidv4 } from 'uuid';
import Customer from '../models/Customer.js';
import Campaign from '../models/Campaign.js';
import Communication from '../models/Communication.js';
import Segment from '../models/Segment.js';
import { buildSegmentQuery } from './segmentEngine.js';

const STUB_URL = process.env.STUB_SERVICE_URL || 'http://localhost:3001';
const BATCH_SIZE = 50;
const BATCH_DELAY_MS = 100;

function personalizeMessage(template, customer) {
  return template.replace(/\[name\]/gi, customer.name.split(' ')[0]);
}

async function sendToStub(payload) {
  const res = await fetch(`${STUB_URL}/stub/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Stub send failed: ${res.status}`);
  }
  return res.json();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function launchCampaign({ segmentId, messageBody, channel, campaignName }) {
  const segment = await Segment.findById(segmentId);
  if (!segment) throw new Error('Segment not found');

  const mongoQuery = buildSegmentQuery(segment.filterCriteria);
  const customers = await Customer.find(mongoQuery);

  const campaign = await Campaign.create({
    name: campaignName,
    segmentId,
    messageBody,
    channel,
    status: 'launching',
    launchedAt: new Date(),
    stats: {
      sent: 0,
      delivered: 0,
      failed: 0,
      opened: 0,
      clicked: 0,
      converted: 0,
    },
  });

  const communications = customers.map((customer) => ({
    campaignId: campaign._id,
    customerId: customer._id,
    channel,
    messageBody: personalizeMessage(messageBody, customer),
    status: 'queued',
    stubMessageId: uuidv4(),
  }));

  if (communications.length === 0) {
    campaign.status = 'complete';
    await campaign.save();
    return {
      campaignId: campaign._id.toString(),
      recipientCount: 0,
      status: 'complete',
      message: 'No customers matched the segment.',
    };
  }

  await Communication.insertMany(communications);

  for (let i = 0; i < communications.length; i += BATCH_SIZE) {
    const batch = communications.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (comm) => {
        const customer = customers.find((c) => c._id.toString() === comm.customerId.toString());
        if (!customer) return;
        await sendToStub({
          stubMsgId: comm.stubMessageId,
          recipient: {
            phone: customer.phone,
            email: customer.email,
            name: customer.name,
          },
          message: comm.messageBody,
          channel,
        });
        await Communication.updateOne(
          { stubMessageId: comm.stubMessageId },
          { $set: { status: 'sent', sentAt: new Date() } }
        );
      })
    );

    await Campaign.updateOne({ _id: campaign._id }, { $inc: { 'stats.sent': batch.length } });

    if (i + BATCH_SIZE < communications.length) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  campaign.status = 'live';
  await campaign.save();

  return {
    campaignId: campaign._id.toString(),
    recipientCount: communications.length,
    status: 'live',
    channel,
    message: `Launched to ${communications.length} recipients over ${channel}.`,
  };
}

export function computeRates(stats) {
  const deliveryRate = stats.sent ? (stats.delivered / stats.sent) * 100 : 0;
  const openRate = stats.delivered ? (stats.opened / stats.delivered) * 100 : 0;
  const clickRate = stats.opened ? (stats.clicked / stats.opened) * 100 : 0;
  const conversionRate = stats.delivered ? (stats.converted / stats.delivered) * 100 : 0;

  return {
    ...stats,
    deliveryRate: Math.round(deliveryRate * 10) / 10,
    openRate: Math.round(openRate * 10) / 10,
    clickRate: Math.round(clickRate * 10) / 10,
    conversionRate: Math.round(conversionRate * 10) / 10,
  };
}
