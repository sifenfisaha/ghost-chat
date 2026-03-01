import { roomsBackendData } from '@/components/rooms/data';
import { type RoomDetailData } from '@/types/rooms';

import { type RoomsStateData } from './rooms.types';

const roomsById = Object.fromEntries(
  roomsBackendData.rooms.map((room) => [room.id, cloneRoom(room)])
);
const roomOrder = roomsBackendData.rooms.map((room) => room.id);

export const initialRoomsState: RoomsStateData = {
  landing: roomsBackendData.landing,
  roomsById,
  roomOrder,
  activeRoomId: roomOrder[0] ?? null,
};

export function cloneRoom(room: RoomDetailData): RoomDetailData {
  return {
    ...room,
    assets: room.assets.map((asset) => ({ ...asset })),
    securityRules: room.securityRules.map((rule) => ({ ...rule })),
    messages: room.messages.map((message) => ({ ...message })),
    logs: room.logs.map((log) => ({ ...log })),
    users: room.users.map((user) => ({ ...user })),
  };
}

export function formatNowTime() {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  return formatter.format(new Date());
}

export function generateRoomId() {
  const token = Math.random().toString(36).slice(2, 10);
  return `s-${token.slice(0, 3)}-${token.slice(3, 6)}-${token.slice(6, 8)}x`;
}
