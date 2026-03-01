import { type StateCreator } from 'zustand';

import { type RoomDetailData } from '@/components/rooms/data';
import { roomsBackendData } from '@/components/rooms/data';

export type RoomsStateData = {
  landing: typeof roomsBackendData.landing;
  roomsById: Record<string, RoomDetailData>;
  roomOrder: string[];
  activeRoomId: string | null;
};

export type RoomsSessionActions = {
  ensureRoom: (roomId: string) => void;
  setActiveRoom: (roomId: string) => void;
  createPrivateSession: () => string;
  joinExistingRoom: () => string | null;
};

export type RoomsMessagingActions = {
  setComposerDraft: (roomId: string, draft: string) => void;
  sendMessage: (roomId: string) => void;
};

export type RoomsState = RoomsStateData &
  RoomsSessionActions &
  RoomsMessagingActions;

export type RoomsStoreSlice<T> = StateCreator<RoomsState, [], [], T>;
