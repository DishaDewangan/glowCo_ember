import { Router } from 'express';
import Campaign from '../models/Campaign.js';
import Communication from '../models/Communication.js';
import { computeRates } from '../services/campaignLauncher.js';

const router = Router();

router.get('/overview', async (_req, res) => {
  try {
    const campaigns = await Campaign.find()
      .populate('segmentId', 'name customerCount')
      .sort({ createdAt: -1 })
      .lean();

    const overview = campaigns.map((c) => ({
      id: c._id,
      name: c.name,
      status: c.status,
      channel: c.channel,
      segmentName: c.segmentId?.name,
      segmentSize: c.segmentId?.customerCount,
      launchedAt: c.launchedAt,
      stats: computeRates(c.stats),
    }));

    res.json(overview);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:campaignId', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.campaignId)
      .populate('segmentId')
      .lean();

    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    const statusBreakdown = await Communication.aggregate([
      { $match: { campaignId: campaign._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({
      ...campaign,
      stats: computeRates(campaign.stats),
      statusBreakdown: Object.fromEntries(
        statusBreakdown.map((s) => [s._id, s.count])
      ),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
