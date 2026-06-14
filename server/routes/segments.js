import { Router } from 'express';
import Segment from '../models/Segment.js';
import Customer from '../models/Customer.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const segments = await Segment.find().sort({ customerCount: -1 }).lean();
    const totalCustomers = await Customer.countDocuments();
    res.json({ totalCustomers, segments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
