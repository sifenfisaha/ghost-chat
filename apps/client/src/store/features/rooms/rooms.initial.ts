import { type RoomDetailData } from '@/types/rooms';

export type RoomsStateData = {
  roomsById: Record<string, RoomDetailData>;
  roomOrder: string[];
  activeRoomId: string | null;
};

export const initialRoomsState: RoomsStateData = {
  roomsById: {},
  roomOrder: [],
  activeRoomId: null,
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

export function createEmptyRoom(roomId: string): RoomDetailData {
  return {
    id: roomId,
    title: `Room ${roomId.slice(0, 6)}`,
    sessionStatus: 'Live Session',
    countdown: '00:00',
    connectionState: 'Connecting...',
    latencyLabel: 'Live',
    operator: 'guest',
    systemBanner: 'ENCRYPTED CHAT CHANNEL READY',
    alert: '',
    assets: [],
    securityRules: [],
    messages: [],
    logs: [],
    users: [],
    encryption: 'AES-256-GCM',
    autoDestruct: '0m',
    autoWipeEnabled: true,
    composerDraft: '',
    composerPlaceholder: 'Type a secure message...',
  };
}
