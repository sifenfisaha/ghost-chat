import { type Server as HttpServer } from 'node:http';

import { Server } from 'socket.io';

import { logger } from '../db/logger.js';
import {
  type AppIoServer,
  type AppIoSocket,
  type ChatMessage,
  type ClientToServerEvents,
  type ServerToClientEvents,
} from '../types/socket.js';

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

  io.on('connection', (socket: AppIoSocket) => {
    socket.data.joinedRooms = new Set<string>();

    logger.info('Socket connected: %s', socket.id);

    socket.on('join_room', (payload, ack) => {
      const roomId = payload.roomId?.trim();

      if (!roomId) {
        const error = 'roomId is required';
        socket.emit('socket_error', { message: error });
        ack?.({ ok: false, error });
        return;
      }

      socket.join(roomId);
      socket.data.joinedRooms.add(roomId);

      ack?.({ ok: true, data: { roomId } });
      logger.info('Socket %s joined room %s', socket.id, roomId);
    });

    socket.on('send_message', (payload, ack) => {
      const roomId = payload.roomId?.trim();
      const text = payload.text?.trim();

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

      const message: ChatMessage = {
        id: `msg-${Date.now()}`,
        roomId,
        text,
        senderId: socket.id,
        createdAt: new Date().toISOString(),
      };

      io.to(roomId).emit('receive_message', message);
      ack?.({ ok: true, data: { message } });
    });

    socket.on('typing', (payload, ack) => {
      const roomId = payload.roomId?.trim();

      if (!roomId) {
        const error = 'roomId is required';
        socket.emit('socket_error', { message: error });
        ack?.({ ok: false, error });
        return;
      }

      const typingState = {
        roomId,
        userId: socket.id,
        isTyping: Boolean(payload.isTyping),
        updatedAt: new Date().toISOString(),
      };

      socket.to(roomId).emit('user_typing', typingState);
      ack?.({ ok: true, data: { roomId, isTyping: typingState.isTyping } });
    });

    socket.on('disconnect', (reason) => {
      logger.info('Socket disconnected: %s (%s)', socket.id, reason);
    });
  });

  return io;
}
