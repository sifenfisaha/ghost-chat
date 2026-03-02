import { httpClient } from '@/lib/http-client';
import { ensureGuestSessionToken } from '@/lib/session-client';
import { type RoomDetailData } from '@/types/rooms';

type CreateRoomResponse = {
  roomId: string;
  title: string;
};

type JoinRoomResponse = {
  roomId: string;
  title: string;
};

type RoomDetailResponse = {
  room: RoomDetailData;
  membership: {
    roomId: string;
    userId: string;
    role: string;
    active: boolean;
    lastSeenAt: string | null;
  };
};

export async function createRoomRequest() {
  await ensureGuestSessionToken();

  const { data } =
    await httpClient.post<CreateRoomResponse>('/api/rooms/create');
  return data;
}

export async function joinRoomRequest(roomId: string) {
  await ensureGuestSessionToken();

  const { data } = await httpClient.post<JoinRoomResponse>('/api/rooms/join', {
    roomId,
  });
  return data;
}

export async function getRoomDetailRequest(roomId: string) {
  await ensureGuestSessionToken();

  const { data } = await httpClient.get<RoomDetailResponse>(
    `/api/rooms/${roomId}`
  );
  return data;
}
