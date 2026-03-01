import { type Server, type Socket } from 'socket.io';

export type Ack<T = undefined> =
  | (T extends undefined ? { ok: true } : { ok: true; data: T })
  | { ok: false; error: string };

export type ChatMessage = {
  id: string;
  roomId: string;
  text: string;
  senderId: string;
  createdAt: string;
};

export type JoinRoomPayload = {
  roomId: string;
};

export type SendMessagePayload = {
  roomId: string;
  text: string;
};

export type TypingPayload = {
  roomId: string;
  isTyping: boolean;
};

export type UserTypingPayload = {
  roomId: string;
  userId: string;
  isTyping: boolean;
  updatedAt: string;
};

export type JoinRoomAck = Ack<{ roomId: string }>;
export type SendMessageAck = Ack<{ message: ChatMessage }>;
export type TypingAck = Ack<{ roomId: string; isTyping: boolean }>;

export type SocketErrorPayload = {
  message: string;
};

export interface ClientToServerEvents {
  join_room: (
    payload: JoinRoomPayload,
    ack?: (res: JoinRoomAck) => void
  ) => void;
  send_message: (
    payload: SendMessagePayload,
    ack?: (res: SendMessageAck) => void
  ) => void;
  typing: (payload: TypingPayload, ack?: (res: TypingAck) => void) => void;
}

export interface ServerToClientEvents {
  receive_message: (message: ChatMessage) => void;
  user_typing: (payload: UserTypingPayload) => void;
  socket_error: (payload: SocketErrorPayload) => void;
}

export type InterServerEvents = Record<string, never>;

export type SocketData = {
  joinedRooms: Set<string>;
};

export type AppIoServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export type AppIoSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
