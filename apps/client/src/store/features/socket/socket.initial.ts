export type SocketConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'disconnected';

export type SocketStateData = {
  namespace: string;
  status: SocketConnectionStatus;
  isConnected: boolean;
  socketId: string | null;
  transport: string | null;
  joinedRoomIds: string[];
  lastError: string | null;
};

export const initialSocketState: SocketStateData = {
  namespace: '/',
  status: 'idle',
  isConnected: false,
  socketId: null,
  transport: null,
  joinedRoomIds: [],
  lastError: null,
};
