import { configureStore } from '@reduxjs/toolkit';
import { roomsReducer } from '@/store/features/rooms/rooms.slice';
import { socketReducer } from '@/store/features/socket/socket.slice';

export const store = configureStore({
  reducer: {
    rooms: roomsReducer,
    socket: socketReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
