import { Router } from 'express';
import Campaign from '../models/Campaign.js';
import { computeRates } from '../services/campaignLauncher.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const campaigns = await Campaign.find()
      .populate('segmentId', 'name customerCount')
      .sort({ createdAt: -1 })
      .lean();

    const enriched = campaigns.map((c) => ({
      ...c,
      stats: computeRates(c.stats),
    }));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('segmentId')
      .lean();

    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    res.json({ ...campaign, stats: computeRates(campaign.stats) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
