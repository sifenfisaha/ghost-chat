import { type StateCreator } from 'zustand';

import { type RoomsState } from '@/types/store';

export type {
  RoomsMessagingActions,
  RoomsState,
  RoomsSessionActions,
  RoomsStateData,
} from '@/types/store';

export type RoomsStoreSlice<T> = StateCreator<RoomsState, [], [], T>;
