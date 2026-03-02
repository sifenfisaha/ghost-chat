import type { NextFunction, Request, Response } from 'express';
import { eq } from 'drizzle-orm';

import { verifySessionToken } from '../auth/session.js';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';

export type AuthContext = {
  userId: string;
  username: string;
};

export type AuthenticatedRequest = Request & {
  auth?: AuthContext;
};

function readBearerToken(req: Request) {
  const value = req.headers.authorization?.trim();
  if (!value || !value.toLowerCase().startsWith('bearer ')) {
    return null;
  }

  return value.slice('bearer '.length).trim();
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  void resolveAuthContext(req, res, next, true);
}

export function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  void resolveAuthContext(req, res, next, false);
}

async function resolveAuthContext(
  req: Request,
  res: Response,
  next: NextFunction,
  required: boolean
) {
  const token = readBearerToken(req);

  if (!token) {
    if (required) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    next();
    return;
  }

  const payload = verifySessionToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Invalid session token' });
    return;
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, payload.userId),
    columns: {
      id: true,
      username: true,
    },
  });

  if (!user) {
    res.status(401).json({ error: 'Session user not found' });
    return;
  }

  (req as AuthenticatedRequest).auth = {
    userId: user.id,
    username: user.username,
  };

  next();
}
