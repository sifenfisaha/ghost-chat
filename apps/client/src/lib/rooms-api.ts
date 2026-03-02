import { httpClient } from '@/lib/http-client';

type CreateRoomResponse = {
  roomId: string;
  password: string;
};

type JoinRoomResponse = {
  roomId: string;
};

export async function createRoomRequest() {
  const { data } =
    await httpClient.post<CreateRoomResponse>('/api/rooms/create');
  return data;
}

export async function joinRoomRequest(roomId: string) {
  const { data } = await httpClient.post<JoinRoomResponse>('/api/rooms/join', {
    roomId,
  });
  return data;
}
