import { Router } from 'express';
import { simulateMessage } from '../services/simulator.js';

const router = Router();

router.post('/send', (req, res) => {
  const { stubMsgId, recipient, message, channel } = req.body;

  if (!stubMsgId || !channel) {
    return res.status(400).json({ error: 'stubMsgId and channel required' });
  }

  console.log(
    `[STUB] Queued ${channel} message ${stubMsgId} → ${recipient?.phone || recipient?.email || 'unknown'}`
  );

  simulateMessage({ stubMsgId, channel });

  res.status(202).json({ accepted: true, stubMsgId });
});

export default router;
