import { type RoomDetailData, type RoomMessage } from '@/components/rooms/data';

import { formatNowTime } from '../rooms.initial';
import {
  type RoomsMessagingActions,
  type RoomsStoreSlice,
} from '../rooms.types';

export const createMessagingSlice: RoomsStoreSlice<RoomsMessagingActions> = (
  set,
  get
) => ({
  setComposerDraft: (roomId, draft) => {
    const room = get().roomsById[roomId];
    if (!room) return;
    set((state) => ({
      roomsById: {
        ...state.roomsById,
        [roomId]: { ...room, composerDraft: draft },
      },
    }));
  },

  sendMessage: (roomId) => {
    const room = get().roomsById[roomId];
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

    const nextRoom: RoomDetailData = {
      ...room,
      composerDraft: '',
      messages: [...room.messages, newMessage],
      logs: [
        {
          id: `log-msg-${Date.now()}`,
          time: formatNowTime(),
          message: `Message sent by ${room.operator}`,
        },
        ...room.logs,
      ],
    };

    set((state) => ({ roomsById: { ...state.roomsById, [roomId]: nextRoom } }));
  },
});
