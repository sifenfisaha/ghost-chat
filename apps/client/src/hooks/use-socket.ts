'use client';

import { useEffect, useMemo, useState } from 'react';

import { disconnectSocketClient, getSocketClient } from '@/socket/client';

import { type UseSocketOptions, type UseSocketResult } from '@/types/socket';

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
