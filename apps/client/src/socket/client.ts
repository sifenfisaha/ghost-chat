import { io, Socket } from 'socket.io-client';

import {
  type AppSocket,
  type ClientToServerEvents,
  type ServerToClientEvents,
  type SocketClientOptions,
} from '@/types/socket';

const DEFAULT_SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:4000';

type SocketRegistry = Map<string, AppSocket>;

const sockets: SocketRegistry = new Map();

export function getSocketClient(
  options: SocketClientOptions = {}
): Socket<ServerToClientEvents, ClientToServerEvents> {
  const namespace = options.namespace ?? '/';

  if (!sockets.has(namespace)) {
    const normalizedNamespace = namespace.startsWith('/')
      ? namespace
      : `/${namespace}`;
    const socketUrl =
      normalizedNamespace === '/'
        ? DEFAULT_SOCKET_URL
        : `${DEFAULT_SOCKET_URL}${normalizedNamespace}`;

    const socket = io(socketUrl, {
      autoConnect: false,
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    sockets.set(namespace, socket);
  }

  return sockets.get(namespace)!;
}

export function disconnectSocketClient(namespace = '/') {
  const socket = sockets.get(namespace);
  if (!socket) return;

  socket.disconnect();
  sockets.delete(namespace);
}
