import { AppDispatch } from '@/store/store';
import { getSocketClient } from '@/socket/client';
import { type ChatMessage, type UserTypingPayload } from '@/types/socket';

import {
  socketConnected,
  socketConnecting,
  socketDisconnected,
  socketErrorReceived,
  socketRoomJoined,
} from './socket.slice';

type BindSocketOptions = {
  namespace?: string;
  autoConnect?: boolean;
};

type BoundSocketHandlers = {
  dispose: () => void;
};

export function bindSocketToStore(
  dispatch: AppDispatch,
  options: BindSocketOptions = {}
): BoundSocketHandlers {
  const namespace = options.namespace ?? '/';
  const autoConnect = options.autoConnect ?? true;
  const socket = getSocketClient({ namespace });

  const onConnect = () => {
    dispatch(
      socketConnected({
        namespace,
        socketId: socket.id ?? null,
        transport: socket.io.engine?.transport?.name ?? null,
      })
    );
  };

  const onDisconnect = (reason: string) => {
    dispatch(socketDisconnected({ reason }));
  };

  const onSocketError = (payload: { message: string }) => {
    dispatch(socketErrorReceived(payload.message));
  };

  const onReceiveMessage = (message: ChatMessage) => {
    void message;
  };

  const onUserTyping = (payload: UserTypingPayload) => {
    void payload;
  };

  dispatch(socketConnecting({ namespace }));

  socket.on('connect', onConnect);
  socket.on('disconnect', onDisconnect);
  socket.on('socket_error', onSocketError);
  socket.on('receive_message', onReceiveMessage);
  socket.on('user_typing', onUserTyping);

  if (autoConnect && !socket.connected) {
    socket.connect();
  }

  if (socket.connected) {
    onConnect();
  }

  return {
    dispose: () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('socket_error', onSocketError);
      socket.off('receive_message', onReceiveMessage);
      socket.off('user_typing', onUserTyping);
    },
  };
}

export function joinSocketRoom(
  roomId: string,
  namespace = '/'
): (dispatch: AppDispatch) => void {
  return (dispatch) => {
    const normalizedRoomId = roomId.trim();
    if (!normalizedRoomId) return;

    const socket = getSocketClient({ namespace });
    socket.emit('join_room', { roomId: normalizedRoomId }, (res) => {
      if (res.ok) {
        dispatch(socketRoomJoined(normalizedRoomId));
        return;
      }

      dispatch(socketErrorReceived(res.error));
    });
  };
}
