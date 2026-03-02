import type { Request, Response } from 'express';
import { Router } from 'express';
import { nanoid } from 'nanoid';

import { createSessionToken } from '../auth/session.js';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';

const router = Router();

router.post('/guest', async (_req: Request, res: Response) => {
  const userId = `usr_${nanoid(12)}`;
  const username = `guest-${nanoid(6)}`;

  await db.insert(users).values({
    id: userId,
    username,
    displayName: username,
  });

  const token = createSessionToken({ userId, username });

  res.status(201).json({
    token,
    user: {
      id: userId,
      username,
    },
  });
});

export default router;
