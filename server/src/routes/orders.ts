import { Router, Request, Response } from 'express';
import { db, Order } from '../db';

const router = Router();

const VALID_STATUSES: Order['status'][] = ['pending', 'baking', 'out-for-delivery', 'delivered'];

router.get('/', (_req: Request, res: Response) => {
  res.json(db.data!.orders);
});

router.post('/', async (req: Request, res: Response) => {
  const { name, items } = req.body as { name: string; items: string[] };
  if (!name || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'name and items[] are required' });
    return;
  }
  const order: Order = {
    id: db.data!.nextOrderId++,
    name,
    items,
    status: 'pending',
    created_at: new Date().toISOString(),
  };
  db.data!.orders.push(order);
  await db.write();
  res.status(201).json(order);
});

router.patch('/:id/status', async (req: Request, res: Response) => {
  const { status } = req.body as { status: Order['status'] };
  if (!VALID_STATUSES.includes(status)) {
    res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
    return;
  }
  const order = db.data!.orders.find((o) => o.id === Number(req.params.id));
  if (!order) {
    res.status(404).json({ error: 'order not found' });
    return;
  }
  order.status = status;
  await db.write();
  res.json(order);
});

export default router;
