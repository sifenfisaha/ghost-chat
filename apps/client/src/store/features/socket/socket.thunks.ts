import { AppDispatch } from '@/store/store';
import { getSocketClient } from '@/socket/client';
import {
  type ChatMessage,
  type RoomPresencePayload,
  type UserTypingPayload,
} from '@/types/socket';
import {
  receiveRealtimeMessage,
  upsertRoomUserPresence,
} from '@/store/features/rooms/rooms.slice';

import {
  socketConnected,
  socketConnecting,
  socketDisconnected,
  socketErrorReceived,
  socketRoomJoined,
  socketUserTypingUpdated,
} from './socket.slice';

type BindSocketOptions = {
  namespace?: string;
  autoConnect?: boolean;
};

type BoundSocketHandlers = {
  dispose: () => void;
};

const pendingJoinRoomKeys = new Set<string>();

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
    dispatch(
      receiveRealtimeMessage({
        roomId: message.roomId,
        id: message.id,
        author: message.author,
        text: message.text,
        variant: message.variant,
        createdAt: message.createdAt,
        senderId: message.senderId,
      })
    );
  };

  const onUserTyping = (payload: UserTypingPayload) => {
    dispatch(
      socketUserTypingUpdated({
        roomId: payload.roomId,
        userId: payload.userId,
        isTyping: payload.isTyping,
      })
    );
  };

  const onRoomPresence = (payload: RoomPresencePayload) => {
    dispatch(
      upsertRoomUserPresence({
        roomId: payload.roomId,
        userId: payload.userId,
        username: payload.username,
        active: payload.active,
        state: payload.state,
      })
    );
  };

  dispatch(socketConnecting({ namespace }));

  socket.on('connect', onConnect);
  socket.on('disconnect', onDisconnect);
  socket.on('socket_error', onSocketError);
  socket.on('receive_message', onReceiveMessage);
  socket.on('user_typing', onUserTyping);
  socket.on('room_presence', onRoomPresence);

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
      socket.off('room_presence', onRoomPresence);
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

    const pendingKey = `${namespace}:${normalizedRoomId}`;
    if (pendingJoinRoomKeys.has(pendingKey)) {
      return;
    }

    const socket = getSocketClient({ namespace });
    pendingJoinRoomKeys.add(pendingKey);

    socket.emit('join_room', { roomId: normalizedRoomId }, (res) => {
      pendingJoinRoomKeys.delete(pendingKey);

      if (res.ok) {
        dispatch(socketRoomJoined(normalizedRoomId));
        return;
      }

      dispatch(socketErrorReceived(res.error));
    });
  };
}

export function sendSocketMessage(
  roomId: string,
  text: string,
  namespace = '/'
): (dispatch: AppDispatch) => void {
  return (dispatch) => {
    const normalizedRoomId = roomId.trim();
    const normalizedText = text.trim();

    if (!normalizedRoomId || !normalizedText) {
      return;
    }

    const socket = getSocketClient({ namespace });
    socket.emit(
      'send_message',
      { roomId: normalizedRoomId, text: normalizedText },
      (res) => {
        if (!res.ok) {
          dispatch(socketErrorReceived(res.error));
        }
      }
    );
  };
}

export function sendSocketTyping(
  roomId: string,
  isTyping: boolean,
  namespace = '/'
): (dispatch: AppDispatch) => void {
  return (dispatch) => {
    const normalizedRoomId = roomId.trim();
    if (!normalizedRoomId) {
      return;
    }

    const socket = getSocketClient({ namespace });
    socket.emit('typing', { roomId: normalizedRoomId, isTyping }, (res) => {
      if (!res.ok) {
        dispatch(socketErrorReceived(res.error));
      }
    });
  };
}
