import { type RoomDetailData } from '@/types/rooms';

export type RoomsStateData = {
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
