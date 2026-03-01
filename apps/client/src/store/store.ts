import { configureStore } from '@reduxjs/toolkit';
import { roomsReducer } from '@/store/features/rooms/rooms.slice';

export const store = configureStore({
  reducer: {
    rooms: roomsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
