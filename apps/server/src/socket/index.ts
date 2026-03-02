import { type Server as HttpServer } from 'node:http';

import { and, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { Server } from 'socket.io';

import { verifySessionToken } from '../auth/session.js';
import { db } from '../db/index.js';
import { logger } from '../db/logger.js';
import {
  roomMembers,
  roomMessages,
  roomTypingStates,
  users,
} from '../db/schema.js';
import {
  type AppIoServer,
  type AppIoSocket,
  type ChatMessage,
  type ClientToServerEvents,
  type RoomPresencePayload,
  type ServerToClientEvents,
} from '../types/socket.js';

type SocketAuthContext = {
  userId: string;
  username: string;
};

function getSocketToken(socket: AppIoSocket) {
  const authToken = socket.handshake.auth.token;
  if (typeof authToken === 'string' && authToken.trim()) {
    return authToken.trim();
  }

  const headerValue = socket.handshake.headers.authorization;
  if (!headerValue || !headerValue.toLowerCase().startsWith('bearer ')) {
    return null;
  }

  return headerValue.slice('bearer '.length).trim();
}

async function resolveSocketAuth(
  socket: AppIoSocket
): Promise<SocketAuthContext | null> {
  const token = getSocketToken(socket);
  if (!token) {
    return null;
  }

  const payload = verifySessionToken(token);
  if (!payload) {
    return null;
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, payload.userId),
    columns: {
      id: true,
      username: true,
    },
  });

  if (!user) {
    return null;
  }

  return {
    userId: user.id,
    username: user.username,
  };
}

async function isRoomMember(roomId: string, userId: string) {
  const membership = await db.query.roomMembers.findFirst({
    where: and(eq(roomMembers.roomId, roomId), eq(roomMembers.userId, userId)),
    columns: {
      roomId: true,
    },
  });

  return Boolean(membership);
}

function emitRoomPresence(
  io: AppIoServer,
  payload: Omit<RoomPresencePayload, 'updatedAt'>
) {
  io.to(payload.roomId).emit('room_presence', {
    ...payload,
    updatedAt: new Date().toISOString(),
  });
}

export function createSocketServer(httpServer: HttpServer) {
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';

  const io: AppIoServer = new Server<
    ClientToServerEvents,
    ServerToClientEvents
  >(httpServer, {
    cors: {
      origin: corsOrigin,
      methods: ['GET', 'POST'],
    },
  });

  io.use(async (socket, next) => {
    const auth = await resolveSocketAuth(socket);
    if (!auth) {
      next(new Error('Unauthorized socket session'));
      return;
    }

    socket.data.auth = auth;
    next();
  });

  io.on('connection', (socket: AppIoSocket) => {
    socket.data.joinedRooms = new Set<string>();
    socket.data.joiningRooms = new Set<string>();

    logger.info('Socket connected: %s', socket.id);

    socket.on('join_room', (payload, ack) => {
      void (async () => {
        try {
          const roomId = payload.roomId?.trim();
          const auth = socket.data.auth;

          if (!roomId) {
            const error = 'roomId is required';
            socket.emit('socket_error', { message: error });
            ack?.({ ok: false, error });
            return;
          }

          if (
            socket.data.joinedRooms.has(roomId) ||
            socket.data.joiningRooms.has(roomId)
          ) {
            ack?.({ ok: true, data: { roomId } });
            return;
          }

          socket.data.joiningRooms.add(roomId);

          try {
            const allowed = await isRoomMember(roomId, auth.userId);
            if (!allowed) {
              const error = 'Membership required before joining socket room';
              socket.emit('socket_error', { message: error });
              ack?.({ ok: false, error });
              return;
            }

            socket.join(roomId);
            socket.data.joinedRooms.add(roomId);

            await db
              .update(roomMembers)
              .set({
                active: true,
                lastSeenAt: new Date(),
              })
              .where(
                and(
                  eq(roomMembers.roomId, roomId),
                  eq(roomMembers.userId, auth.userId)
                )
              );

            emitRoomPresence(io, {
              roomId,
              userId: auth.userId,
              username: auth.username,
              active: true,
              state: 'Active',
            });

            const systemMessageId = `msg_${nanoid(12)}`;
            const systemMessageText = `${auth.username} joined the room`;

            await db.insert(roomMessages).values({
              id: systemMessageId,
              roomId,
              senderUserId: null,
              senderSocketId: socket.id,
              author: 'System',
              message: systemMessageText,
              variant: 'system',
            });

            io.to(roomId).emit('receive_message', {
              id: systemMessageId,
              roomId,
              text: systemMessageText,
              author: 'System',
              variant: 'system',
              senderId: 'system',
              createdAt: new Date().toISOString(),
            });

            ack?.({ ok: true, data: { roomId } });
            logger.info('Socket %s joined room %s', socket.id, roomId);
          } finally {
            socket.data.joiningRooms.delete(roomId);
          }
        } catch (error) {
          logger.error('join_room failed for socket %s: %o', socket.id, error);
          ack?.({ ok: false, error: 'Failed to join room' });
        }
      })();
    });

    socket.on('send_message', (payload, ack) => {
      void (async () => {
        try {
          const roomId = payload.roomId?.trim();
          const text = payload.text?.trim();
          const auth = socket.data.auth;

          if (!roomId) {
            const error = 'roomId is required';
            socket.emit('socket_error', { message: error });
            ack?.({ ok: false, error });
            return;
          }

          if (!text) {
            const error = 'text is required';
            socket.emit('socket_error', { message: error });
            ack?.({ ok: false, error });
            return;
          }

          if (!socket.data.joinedRooms.has(roomId)) {
            const error = 'Socket has not joined the room';
            socket.emit('socket_error', { message: error });
            ack?.({ ok: false, error });
            return;
          }

          const allowed = await isRoomMember(roomId, auth.userId);
          if (!allowed) {
            const error = 'Membership required to send messages';
            socket.emit('socket_error', { message: error });
            ack?.({ ok: false, error });
            return;
          }

          const messageId = `msg_${nanoid(12)}`;
          const createdAtDate = new Date();

          await db.insert(roomMessages).values({
            id: messageId,
            roomId,
            senderUserId: auth.userId,
            senderSocketId: socket.id,
            author: auth.username,
            message: text,
          });

          const message: ChatMessage = {
            id: messageId,
            roomId,
            text,
            author: auth.username,
            variant: 'default',
            senderId: auth.userId,
            createdAt: createdAtDate.toISOString(),
          };

          io.to(roomId).emit('receive_message', message);
          ack?.({ ok: true, data: { message } });
        } catch (error) {
          logger.error(
            'send_message failed for socket %s: %o',
            socket.id,
            error
          );
          ack?.({ ok: false, error: 'Failed to send message' });
        }
      })();
    });

    socket.on('typing', (payload, ack) => {
      void (async () => {
        try {
          const roomId = payload.roomId?.trim();
          const auth = socket.data.auth;

          if (!roomId) {
            const error = 'roomId is required';
            socket.emit('socket_error', { message: error });
            ack?.({ ok: false, error });
            return;
          }

          if (!socket.data.joinedRooms.has(roomId)) {
            const error = 'Socket has not joined the room';
            socket.emit('socket_error', { message: error });
            ack?.({ ok: false, error });
            return;
          }

          await db
            .insert(roomTypingStates)
            .values({
              roomId,
              userId: auth.userId,
              isTyping: Boolean(payload.isTyping),
              updatedAt: new Date(),
            })
            .onConflictDoUpdate({
              target: [roomTypingStates.roomId, roomTypingStates.userId],
              set: {
                isTyping: Boolean(payload.isTyping),
                updatedAt: new Date(),
              },
            });

          const typingState = {
            roomId,
            userId: auth.userId,
            isTyping: Boolean(payload.isTyping),
            updatedAt: new Date().toISOString(),
          };

          socket.to(roomId).emit('user_typing', typingState);
          ack?.({ ok: true, data: { roomId, isTyping: typingState.isTyping } });
        } catch (error) {
          logger.error('typing failed for socket %s: %o', socket.id, error);
          ack?.({ ok: false, error: 'Failed to update typing state' });
        }
      })();
    });

    socket.on('disconnect', (reason) => {
      void (async () => {
        try {
          const auth = socket.data.auth;

          for (const roomId of socket.data.joinedRooms) {
            await db
              .update(roomMembers)
              .set({
                active: false,
                lastSeenAt: new Date(),
              })
              .where(
                and(
                  eq(roomMembers.roomId, roomId),
                  eq(roomMembers.userId, auth.userId)
                )
              );

            emitRoomPresence(io, {
              roomId,
              userId: auth.userId,
              username: auth.username,
              active: false,
              state: 'Offline',
            });
          }
        } catch (error) {
          logger.error(
            'disconnect cleanup failed for socket %s: %o',
            socket.id,
            error
          );
        }

        logger.info('Socket disconnected: %s (%s)', socket.id, reason);
      })();
    });
  });

  return io;
}
