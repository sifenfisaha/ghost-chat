'use client';

import { useEffect, useMemo, useState } from 'react';
import { type Socket } from 'socket.io-client';

import { disconnectSocketClient, getSocketClient } from '@/socket/client';

export type UseSocketOptions = {
  enabled?: boolean;
  autoConnect?: boolean;
  disconnectOnUnmount?: boolean;
  namespace?: string;
};

export type UseSocketResult = {
  socket: Socket;
  isConnected: boolean;
  socketId: string | null;
  transport: string | null;
};

export function useSocket(options: UseSocketOptions = {}): UseSocketResult {
  const {
    enabled = true,
    autoConnect = true,
    disconnectOnUnmount = false,
    namespace = '/',
  } = options;

  const socket = useMemo(() => getSocketClient({ namespace }), [namespace]);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [socketId, setSocketId] = useState<string | null>(socket.id ?? null);
  const [transport, setTransport] = useState<string | null>(
    socket.io.engine?.transport?.name ?? null
  );

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      setSocketId(socket.id ?? null);
      setTransport(socket.io.engine?.transport?.name ?? null);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setTransport(null);
    };

    if (enabled && autoConnect && !socket.connected) {
      socket.connect();
    }

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);

      if (disconnectOnUnmount) {
        disconnectSocketClient(namespace);
      }
    };
  }, [autoConnect, disconnectOnUnmount, enabled, namespace, socket]);

  return {
    socket,
    isConnected,
    socketId,
    transport,
  };
}
