import { type Server as HttpServer } from 'node:http';

import { Server } from 'socket.io';

import { logger } from '../db/logger';

export function createSocketServer(httpServer: HttpServer) {
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';

  const io = new Server(httpServer, {
    cors: {
      origin: corsOrigin,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    logger.info('Socket connected: %s', socket.id);

    socket.on('disconnect', (reason) => {
      logger.info('Socket disconnected: %s (%s)', socket.id, reason);
    });
  });

  return io;
}
