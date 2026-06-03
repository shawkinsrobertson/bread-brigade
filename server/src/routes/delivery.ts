import { Router } from 'express';
import { db } from '../db';

const router = Router();

router.get('/', async (_req, res) => {
  await db.read();
  res.json(db.data!.delivery);
});

router.post('/', async (req, res) => {
  const { items } = req.body;
  if (!items || typeof items !== 'string') {
    return res.status(400).json({ error: 'items is required' });
  }
  await db.read();
  db.data!.delivery = {
    items,
    status: 'on-the-way',
    started_at: new Date().toISOString(),
    delivered_at: null,
  };
  await db.write();
  res.json(db.data!.delivery);
});

router.patch('/status', async (req, res) => {
  const { status } = req.body;
  if (!['idle', 'on-the-way', 'delivered'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  await db.read();
  db.data!.delivery.status = status;
  if (status === 'delivered') {
    db.data!.delivery.delivered_at = new Date().toISOString();
  }
  if (status === 'idle') {
    db.data!.delivery = { items: '', status: 'idle', started_at: null, delivered_at: null };
  }
  await db.write();
  res.json(db.data!.delivery);
});

export default router;
