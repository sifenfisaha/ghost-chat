import { Router } from 'express';
import type { Request, Response } from 'express';
import { and, asc, desc, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import { db } from '../db/index.js';
import {
  roomAssets,
  roomLogs,
  roomMembers,
  roomMessages,
  roomSecurityRules,
  rooms,
  users,
} from '../db/schema.js';
import { type AuthenticatedRequest, requireAuth } from '../middleware/auth.js';

const router = Router();

async function readMembership(roomId: string, userId: string) {
  return db.query.roomMembers.findFirst({
    where: and(eq(roomMembers.roomId, roomId), eq(roomMembers.userId, userId)),
    columns: {
      roomId: true,
      userId: true,
      role: true,
      active: true,
      lastSeenAt: true,
    },
  });
}

function mustAuth(req: Request, res: Response) {
  const auth = (req as AuthenticatedRequest).auth;
  if (!auth) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }

  return auth;
}

function readRoomIdParam(req: Request) {
  const raw = req.params.roomId;
  if (Array.isArray(raw)) {
    return raw[0]?.trim() ?? '';
  }

  return typeof raw === 'string' ? raw.trim() : '';
}

router.post('/create', requireAuth, async (req: Request, res: Response) => {
  const auth = (req as AuthenticatedRequest).auth;
  if (!auth) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const roomId = nanoid(12);
  const title = `Secure Room ${roomId.slice(0, 4)}`;

  await db.insert(rooms).values({
    id: roomId,
    title,
    ownerUserId: auth.userId,
  });

  await db.insert(roomMembers).values({
    roomId,
    userId: auth.userId,
    role: 'owner',
    active: true,
  });

  await db.insert(roomLogs).values({
    id: `log_${nanoid(12)}`,
    roomId,
    message: `Room created by ${auth.username}`,
  });

  res.status(201).json({ roomId, title });
});

router.post('/join', requireAuth, async (req: Request, res: Response) => {
  const auth = mustAuth(req, res);
  if (!auth) return;

  const { roomId } = req.body as {
    roomId?: string;
  };

  if (!roomId) {
    res.status(400).json({ error: 'roomId is required' });
    return;
  }

  const room = await db.query.rooms.findFirst({
    where: and(eq(rooms.id, roomId), eq(rooms.isArchived, false)),
    columns: {
      id: true,
      title: true,
    },
  });

  if (!room) {
    res.status(404).json({ error: 'Room not found' });
    return;
  }

  await db
    .insert(roomMembers)
    .values({
      roomId,
      userId: auth.userId,
      role: 'member',
      active: true,
      lastSeenAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [roomMembers.roomId, roomMembers.userId],
      set: {
        active: true,
        lastSeenAt: new Date(),
      },
    });

  await db.insert(roomLogs).values({
    id: `log_${nanoid(12)}`,
    roomId,
    message: `${auth.username} joined room`,
  });

  res.json({ roomId, title: room.title });
});

router.get('/:roomId', requireAuth, async (req: Request, res: Response) => {
  const auth = mustAuth(req, res);
  if (!auth) return;

  const roomId = readRoomIdParam(req);
  if (!roomId) {
    res.status(400).json({ error: 'roomId is required' });
    return;
  }

  const membership = await readMembership(roomId, auth.userId);
  if (!membership) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const room = await db.query.rooms.findFirst({
    where: and(eq(rooms.id, roomId), eq(rooms.isArchived, false)),
  });

  if (!room) {
    res.status(404).json({ error: 'Room not found' });
    return;
  }

  const [members, messages, logs, securityRules, assets] = await Promise.all([
    db
      .select({
        id: users.id,
        name: users.username,
        active: roomMembers.active,
        state: roomMembers.stateLabel,
      })
      .from(roomMembers)
      .innerJoin(users, eq(roomMembers.userId, users.id))
      .where(eq(roomMembers.roomId, roomId))
      .orderBy(asc(users.username)),
    db.query.roomMessages.findMany({
      where: eq(roomMessages.roomId, roomId),
      orderBy: [asc(roomMessages.createdAt)],
      limit: 100,
    }),
    db.query.roomLogs.findMany({
      where: eq(roomLogs.roomId, roomId),
      orderBy: [desc(roomLogs.createdAt)],
      limit: 100,
    }),
    db.query.roomSecurityRules.findMany({
      where: eq(roomSecurityRules.roomId, roomId),
      orderBy: [asc(roomSecurityRules.createdAt)],
    }),
    db.query.roomAssets.findMany({
      where: eq(roomAssets.roomId, roomId),
      orderBy: [desc(roomAssets.createdAt)],
    }),
  ]);

  const roomData = {
    id: room.id,
    title: room.title,
    sessionStatus: room.sessionStatus,
    countdown: `${room.autoDestructMinutes.toString().padStart(2, '0')}:00`,
    connectionState: room.connectionState,
    latencyLabel: 'Live',
    operator: auth.username,
    systemBanner: 'ENCRYPTED CHAT CHANNEL READY',
    alert: 'Messages are encrypted in transit and controlled by room policy.',
    assets: assets.map((asset) => ({
      id: asset.id,
      name: asset.name,
      meta: asset.meta,
      ttl: asset.ttlLabel,
      kind: asset.kind,
    })),
    securityRules: securityRules.map((rule) => ({
      id: rule.id,
      label: rule.label,
      detail: rule.detail,
      enabled: rule.enabled,
    })),
    messages: messages.map((message) => ({
      id: message.id,
      author: message.author,
      time: message.createdAt.toISOString(),
      message: message.message,
      variant:
        message.variant === 'system'
          ? 'system'
          : message.senderUserId === auth.userId
            ? 'primary'
            : 'default',
    })),
    logs: logs.map((log) => ({
      id: log.id,
      time: log.createdAt.toISOString(),
      message: log.message,
    })),
    users: members,
    encryption: room.encryption,
    autoDestruct: `${room.autoDestructMinutes}m`,
    autoWipeEnabled: room.autoWipeEnabled,
    composerDraft: '',
    composerPlaceholder: 'Type a secure message...',
  };

  res.json({ room: roomData, membership });
});

router.get(
  '/:roomId/messages',
  requireAuth,
  async (req: Request, res: Response) => {
    const auth = mustAuth(req, res);
    if (!auth) return;

    const roomId = readRoomIdParam(req);
    if (!roomId) {
      res.status(400).json({ error: 'roomId is required' });
      return;
    }

    const membership = await readMembership(roomId, auth.userId);
    if (!membership) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const rawLimit = Number(req.query.limit);
    const limit = Number.isFinite(rawLimit)
      ? Math.max(1, Math.min(200, Math.trunc(rawLimit)))
      : 100;

    const rows = await db.query.roomMessages.findMany({
      where: eq(roomMessages.roomId, roomId),
      orderBy: [desc(roomMessages.createdAt)],
      limit,
    });

    res.json({
      roomId,
      messages: rows
        .slice()
        .reverse()
        .map((message) => ({
          id: message.id,
          roomId,
          senderId: message.senderUserId ?? '',
          text: message.message,
          createdAt: message.createdAt.toISOString(),
        })),
    });
  }
);

export default router;
