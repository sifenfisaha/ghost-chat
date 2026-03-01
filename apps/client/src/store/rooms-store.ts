import { create } from "zustand";

import { roomsBackendData, type RoomDetailData, type RoomMessage } from "@/components/rooms/data";

type RoomsState = {
  landing: typeof roomsBackendData.landing;
  roomsById: Record<string, RoomDetailData>;
  roomOrder: string[];
  activeRoomId: string | null;
  ensureRoom: (roomId: string) => void;
  setActiveRoom: (roomId: string) => void;
  createPrivateSession: () => string;
  joinExistingRoom: () => string | null;
  toggleSecurityRule: (roomId: string, ruleId: string) => void;
  setAutoWipe: (roomId: string, enabled: boolean) => void;
  setComposerDraft: (roomId: string, draft: string) => void;
  sendMessage: (roomId: string) => void;
};

const roomsById = Object.fromEntries(roomsBackendData.rooms.map((room) => [room.id, cloneRoom(room)]));
const roomOrder = roomsBackendData.rooms.map((room) => room.id);

export const useRoomsStore = create<RoomsState>((set, get) => ({
  landing: roomsBackendData.landing,
  roomsById,
  roomOrder,
  activeRoomId: roomOrder[0] ?? null,

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
      { id: `log-created-${Date.now()}`, time: formatNowTime(), message: "Room created from secure launcher" },
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

  toggleSecurityRule: (roomId, ruleId) => {
    const room = get().roomsById[roomId];
    if (!room) return;

    const nextRoom: RoomDetailData = {
      ...room,
      securityRules: room.securityRules.map((rule) =>
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      ),
    };

    set((state) => ({ roomsById: { ...state.roomsById, [roomId]: nextRoom } }));
  },

  setAutoWipe: (roomId, enabled) => {
    const room = get().roomsById[roomId];
    if (!room) return;
    set((state) => ({
      roomsById: { ...state.roomsById, [roomId]: { ...room, autoWipeEnabled: enabled } },
    }));
  },

  setComposerDraft: (roomId, draft) => {
    const room = get().roomsById[roomId];
    if (!room) return;
    set((state) => ({
      roomsById: { ...state.roomsById, [roomId]: { ...room, composerDraft: draft } },
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
      variant: "primary",
    };

    const nextRoom: RoomDetailData = {
      ...room,
      composerDraft: "",
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
}));

function cloneRoom(room: RoomDetailData): RoomDetailData {
  return {
    ...room,
    assets: room.assets.map((asset) => ({ ...asset })),
    securityRules: room.securityRules.map((rule) => ({ ...rule })),
    messages: room.messages.map((message) => ({ ...message })),
    logs: room.logs.map((log) => ({ ...log })),
    users: room.users.map((user) => ({ ...user })),
  };
}

function formatNowTime() {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  return formatter.format(new Date());
}

function generateRoomId() {
  const token = Math.random().toString(36).slice(2, 10);
  return `s-${token.slice(0, 3)}-${token.slice(3, 6)}-${token.slice(6, 8)}x`;
}
