import { roomsBackendData } from '@/components/rooms/data';

import { cloneRoom, formatNowTime, generateRoomId } from '../rooms.initial';
import { type RoomsSessionActions, type RoomsStoreSlice } from '../rooms.types';

export const createSessionSlice: RoomsStoreSlice<RoomsSessionActions> = (
  set,
  get
) => ({
  ensureRoom: (roomId) => {
    const { roomsById: currentRooms, roomOrder: currentOrder } = get();
    if (currentRooms[roomId]) return;

    const sourceRoom = roomsBackendData.rooms[0];
    const nextRoom = cloneRoom(sourceRoom);
    nextRoom.id = roomId;

    set({
      roomsById: { ...currentRooms, [roomId]: nextRoom },
      roomOrder: [...currentOrder, roomId],
      activeRoomId: roomId,
    });
  },

  setActiveRoom: (roomId) => {
    const { roomsById: currentRooms } = get();
    if (!currentRooms[roomId]) return;
    set({ activeRoomId: roomId });
  },

  createPrivateSession: () => {
    const { roomsById: currentRooms, roomOrder: currentOrder } = get();
    const roomId = generateRoomId();
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

    set({
      roomsById: { ...currentRooms, [roomId]: nextRoom },
      roomOrder: [roomId, ...currentOrder],
      activeRoomId: roomId,
    });

    return roomId;
  },

  joinExistingRoom: () => {
    const { roomOrder: currentOrder } = get();
    const roomId = currentOrder[0] ?? null;
    if (!roomId) return null;
    set({ activeRoomId: roomId });
    return roomId;
  },
});
