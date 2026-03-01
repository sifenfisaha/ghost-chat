import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { roomsBackendData } from '@/components/rooms/data';
import { type RoomMessage } from '@/types/rooms';

import {
  cloneRoom,
  formatNowTime,
  generateRoomId,
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

      const sourceRoom = roomsBackendData.rooms[0];
      const nextRoom = cloneRoom(sourceRoom);
      nextRoom.id = roomId;

      state.roomsById[roomId] = nextRoom;
      state.roomOrder.push(roomId);
      state.activeRoomId = roomId;
    },

    setActiveRoom: (state, action: PayloadAction<string>) => {
      const roomId = action.payload;
      if (!state.roomsById[roomId]) return;
      state.activeRoomId = roomId;
    },

    createPrivateSession: {
      reducer: (state, action: PayloadAction<string>) => {
        const roomId = action.payload;
        const sourceRoom = roomsBackendData.rooms[0];
        const nextRoom = cloneRoom(sourceRoom);
        nextRoom.id = roomId;
        nextRoom.logs = [
          {
            id: `log-created-${Date.now()}`,
            time: formatNowTime(),
            message: 'Room created from secure launcher',
          },
          ...nextRoom.logs,
        ];

        state.roomsById[roomId] = nextRoom;
        state.roomOrder.unshift(roomId);
        state.activeRoomId = roomId;
      },
      prepare: () => ({
        payload: generateRoomId(),
      }),
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
  },
});

export const {
  ensureRoom,
  setActiveRoom,
  createPrivateSession,
  joinExistingRoom,
  setComposerDraft,
  sendMessage,
} = roomsSlice.actions;

export const roomsReducer = roomsSlice.reducer;

export type RoomsSliceState = RoomsStateData;
