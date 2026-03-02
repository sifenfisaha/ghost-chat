import { Router } from 'express';
import type { Request, Response } from 'express';
import { nanoid } from 'nanoid';

const router = Router();

router.post('/create', (req: Request, res: Response) => {
  const roomId = nanoid(12);
  const password = nanoid(12);
  res.json({ roomId, password });
});

router.post('/join', (req: Request, res: Response) => {
  const { roomId } = req.body;
  if (!roomId) {
    return res.status(400).json({ error: 'roomId is required' });
  }
  res.json({ roomId });
});

export default router;
