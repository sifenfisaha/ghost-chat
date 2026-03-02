'use client';

import { useEffect, useMemo } from 'react';

import { disconnectSocketClient, getSocketClient } from '@/socket/client';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { bindSocketToStore } from '@/store/features/socket/socket.thunks';

import { type UseSocketOptions, type UseSocketResult } from '@/types/socket';

export function useSocket(options: UseSocketOptions = {}): UseSocketResult {
  const dispatch = useAppDispatch();
  const {
    enabled = true,
    autoConnect = true,
    disconnectOnUnmount = false,
    namespace = '/',
  } = options;

  const socket = useMemo(() => getSocketClient({ namespace }), [namespace]);
  const { isConnected, socketId, transport } = useAppSelector(
    (state) => state.socket
  );

  useEffect(() => {
    if (!enabled) return;

    const binding = bindSocketToStore(dispatch, {
      namespace,
      autoConnect,
    });

    return () => {
      binding.dispose();

      if (disconnectOnUnmount) {
        disconnectSocketClient(namespace);
      }
    };
  }, [autoConnect, dispatch, disconnectOnUnmount, enabled, namespace]);

  return {
    socket,
    isConnected,
    socketId,
    transport,
  };
}
