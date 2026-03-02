import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { initialSocketState, type SocketStateData } from './socket.initial';

type SocketConnectedPayload = {
  namespace: string;
  socketId: string | null;
  transport: string | null;
};

type SocketDisconnectedPayload = {
  reason?: string;
};

const socketSlice = createSlice({
  name: 'socket',
  initialState: initialSocketState,
  reducers: {
    socketConnecting: (state, action: PayloadAction<{ namespace: string }>) => {
      state.namespace = action.payload.namespace;
      state.status = 'connecting';
      state.lastError = null;
    },

    socketConnected: (state, action: PayloadAction<SocketConnectedPayload>) => {
      state.namespace = action.payload.namespace;
      state.status = 'connected';
      state.isConnected = true;
      state.socketId = action.payload.socketId;
      state.transport = action.payload.transport;
      state.lastError = null;
    },

    socketDisconnected: (
      state,
      action: PayloadAction<SocketDisconnectedPayload | undefined>
    ) => {
      state.status = 'disconnected';
      state.isConnected = false;
      state.socketId = null;
      state.transport = null;

      const reason = action.payload?.reason?.trim();
      if (reason) {
        state.lastError = reason;
      }
    },

    socketTransportUpdated: (state, action: PayloadAction<string | null>) => {
      state.transport = action.payload;
    },

    socketRoomJoined: (state, action: PayloadAction<string>) => {
      const roomId = action.payload.trim();
      if (!roomId) return;
      if (!state.joinedRoomIds.includes(roomId)) {
        state.joinedRoomIds.push(roomId);
      }
    },

    socketErrorReceived: (state, action: PayloadAction<string>) => {
      state.lastError = action.payload;
    },

    socketErrorCleared: (state) => {
      state.lastError = null;
    },
  },
});

export const {
  socketConnecting,
  socketConnected,
  socketDisconnected,
  socketTransportUpdated,
  socketRoomJoined,
  socketErrorReceived,
  socketErrorCleared,
} = socketSlice.actions;

export const socketReducer = socketSlice.reducer;

export type SocketSliceState = SocketStateData;
