import { create } from 'zustand';

import { initialRoomsState } from '@/store/rooms/rooms.initial';
import { createMessagingSlice } from '@/store/rooms/slices/messaging.slice';
import { createSessionSlice } from '@/store/rooms/slices/session.slice';
import { type RoomsState } from '@/store/rooms/rooms.types';

export const useRoomsStore = create<RoomsState>()((...args) => ({
  ...initialRoomsState,
  ...createSessionSlice(...args),
  ...createMessagingSlice(...args),
}));
