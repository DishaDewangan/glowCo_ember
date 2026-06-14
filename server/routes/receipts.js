import { Router } from 'express';
import Communication from '../models/Communication.js';
import Campaign from '../models/Campaign.js';
import { computeRates } from '../services/campaignLauncher.js';

const router = Router();

const STATUS_ORDER = ['queued', 'sent', 'delivered', 'failed', 'opened', 'clicked'];

const STAT_COUNTERS = {
  delivered: 'delivered',
  failed: 'failed',
  opened: 'opened',
  clicked: 'clicked',
};

router.post('/crm/receipts', async (req, res) => {
  try {
    const { stubMsgId, event, timestamp } = req.body;

    if (!stubMsgId || !event) {
      return res.status(400).json({ error: 'stubMsgId and event required' });
    }

    const comm = await Communication.findOne({ stubMessageId: stubMsgId });
    if (!comm) return res.status(404).json({ error: 'unknown stubMsgId' });

    const currentIdx = STATUS_ORDER.indexOf(comm.status);
    const eventIdx = STATUS_ORDER.indexOf(event);

    if (currentIdx >= eventIdx) {
      return res.status(200).json({ skipped: true });
    }

    const ts = timestamp ? new Date(timestamp) : new Date();
    const updates = { status: event };

    if (event === 'delivered') updates.deliveredAt = ts;
    if (event === 'opened') updates.openedAt = ts;
    if (event === 'clicked') {
      updates.clickedAt = ts;
      if (comm.status !== 'opened' && comm.status !== 'clicked') {
        updates.openedAt = ts;
      }
    }
    if (event === 'failed') updates.status = 'failed';

    await Communication.updateOne({ stubMessageId: stubMsgId }, { $set: updates });

    const counterField = STAT_COUNTERS[event];
    if (counterField) {
      await Campaign.updateOne(
        { _id: comm.campaignId },
        { $inc: { [`stats.${counterField}`]: 1 } }
      );

      const campaign = await Campaign.findById(comm.campaignId);
      if (campaign) {
        const stats = computeRates(
          campaign.stats.toObject ? campaign.stats.toObject() : campaign.stats
        );
        await Campaign.updateOne({ _id: comm.campaignId }, { $set: { stats } });
      }
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Receipt handler error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
