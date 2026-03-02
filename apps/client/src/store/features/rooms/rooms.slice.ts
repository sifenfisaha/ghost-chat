import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { type RoomDetailData, type RoomMessage } from '@/types/rooms';

import {
  createEmptyRoom,
  formatNowTime,
  initialRoomsState,
  type RoomsStateData,
} from './rooms.initial';

const roomsSlice = createSlice({
  name: 'rooms',
  initialState: initialRoomsState,
  reducers: {
    ensureRoom: (state, action: PayloadAction<string>) => {
      const roomId = action.payload;
      if (state.roomsById[roomId]) return;

      const nextRoom = createEmptyRoom(roomId);

      state.roomsById[roomId] = nextRoom;
      state.roomOrder.push(roomId);
      state.activeRoomId = roomId;
    },

    setActiveRoom: (state, action: PayloadAction<string>) => {
      const roomId = action.payload;
      if (!state.roomsById[roomId]) return;
      state.activeRoomId = roomId;
    },

    createPrivateSession: (state, action: PayloadAction<string>) => {
      const roomId = action.payload;
      const nextRoom = createEmptyRoom(roomId);
      nextRoom.logs = [
        {
          id: `log-created-${Date.now()}`,
          time: formatNowTime(),
          message: 'Room created from secure launcher',
        },
        ...nextRoom.logs,
      ];

      state.roomsById[roomId] = nextRoom;
      if (!state.roomOrder.includes(roomId)) {
        state.roomOrder.unshift(roomId);
      }
      state.activeRoomId = roomId;
    },

    hydrateRoomFromServer: (state, action: PayloadAction<RoomDetailData>) => {
      const room = action.payload;
      state.roomsById[room.id] = {
        ...room,
        composerDraft: state.roomsById[room.id]?.composerDraft ?? '',
      };

      if (!state.roomOrder.includes(room.id)) {
        state.roomOrder.unshift(room.id);
      }

      state.activeRoomId = room.id;
    },

    joinExistingRoom: (
      state,
      action: PayloadAction<string | null | undefined>
    ) => {
      const roomId = action.payload ?? state.roomOrder[0] ?? null;
      if (!roomId) return;
      state.activeRoomId = roomId;
    },

    setComposerDraft: (
      state,
      action: PayloadAction<{ roomId: string; draft: string }>
    ) => {
      const { roomId, draft } = action.payload;
      const room = state.roomsById[roomId];
      if (!room) return;

      room.composerDraft = draft;
    },

    clearComposerDraft: (state, action: PayloadAction<string>) => {
      const roomId = action.payload;
      const room = state.roomsById[roomId];
      if (!room) return;
      room.composerDraft = '';
    },

    sendMessage: (state, action: PayloadAction<string>) => {
      const roomId = action.payload;
      const room = state.roomsById[roomId];
      if (!room) return;

      const trimmedDraft = room.composerDraft.trim();
      if (!trimmedDraft) return;

      const newMessage: RoomMessage = {
        id: `msg-${Date.now()}`,
        author: room.operator,
        time: formatNowTime(),
        message: trimmedDraft,
        variant: 'primary',
      };

      room.composerDraft = '';
      room.messages.push(newMessage);
      room.logs.unshift({
        id: `log-msg-${Date.now()}`,
        time: formatNowTime(),
        message: `Message sent by ${room.operator}`,
      });
    },

    receiveRealtimeMessage: (
      state,
      action: PayloadAction<{
        roomId: string;
        id: string;
        author: string;
        text: string;
        variant?: 'default' | 'primary' | 'system';
        createdAt: string;
        senderId: string;
      }>
    ) => {
      const payload = action.payload;
      const room = state.roomsById[payload.roomId];
      if (!room) return;

      if (room.messages.some((message) => message.id === payload.id)) {
        return;
      }

      room.messages.push({
        id: payload.id,
        author: payload.author,
        message: payload.text,
        time: payload.createdAt,
        variant:
          payload.variant === 'system'
            ? 'system'
            : payload.author === room.operator
              ? 'primary'
              : 'default',
      });
    },

    upsertRoomUserPresence: (
      state,
      action: PayloadAction<{
        roomId: string;
        userId: string;
        username: string;
        active: boolean;
        state: string;
      }>
    ) => {
      const {
        roomId,
        userId,
        username,
        active,
        state: statusLabel,
      } = action.payload;
      const room = state.roomsById[roomId];
      if (!room) return;

      const existingUser = room.users.find((user) => user.id === userId);
      if (existingUser) {
        existingUser.active = active;
        existingUser.state = statusLabel;
        existingUser.name = username || existingUser.name;
        return;
      }

      room.users.push({
        id: userId,
        name: username,
        active,
        state: statusLabel,
      });
    },
  },
});

export const {
  ensureRoom,
  setActiveRoom,
  createPrivateSession,
  hydrateRoomFromServer,
  joinExistingRoom,
  receiveRealtimeMessage,
  upsertRoomUserPresence,
  clearComposerDraft,
  setComposerDraft,
  sendMessage,
} = roomsSlice.actions;

export const roomsReducer = roomsSlice.reducer;

export type RoomsSliceState = RoomsStateData;
