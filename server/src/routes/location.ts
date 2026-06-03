import { Router, Request, Response } from 'express';
import { db } from '../db';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json(db.data!.location);
});

router.post('/', async (req: Request, res: Response) => {
  const { latitude, longitude } = req.body as { latitude: number; longitude: number };
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    res.status(400).json({ error: 'latitude and longitude must be numbers' });
    return;
  }
  db.data!.location = { latitude, longitude, updated_at: new Date().toISOString() };
  await db.write();
  res.json({ ok: true });
});

export default router;
