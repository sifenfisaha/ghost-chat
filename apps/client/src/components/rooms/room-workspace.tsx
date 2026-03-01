'use client';

import { useEffect } from 'react';

import { useRoomsStore } from '@/store/rooms-store';
import { RoomChatPanel } from '@/components/rooms/room-chat-panel';
import { RoomHeader } from '@/components/rooms/room-header';
import { RoomRightPanel } from '@/components/rooms/room-right-panel';
import { useSocket } from '@/hooks/use-socket';

type RoomWorkspaceProps = {
  roomId: string;
};

export function RoomWorkspace({ roomId }: RoomWorkspaceProps) {
  const ensureRoom = useRoomsStore((state) => state.ensureRoom);
  const setActiveRoom = useRoomsStore((state) => state.setActiveRoom);

  useSocket({
    enabled: Boolean(roomId),
    autoConnect: true,
    disconnectOnUnmount: false,
  });

  useEffect(() => {
    ensureRoom(roomId);
    setActiveRoom(roomId);
  }, [ensureRoom, roomId, setActiveRoom]);

  return (
    <main className="bg-background text-foreground relative h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,hsl(from_var(--color-border)_h_s_l/0.28)_1px,transparent_1px),linear-gradient(to_bottom,hsl(from_var(--color-border)_h_s_l/0.28)_1px,transparent_1px)] bg-size-[42px_42px] opacity-30" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(from_var(--color-primary)_h_s_l/0.16),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent,hsl(from_var(--color-background)_h_s_l/0.94)_88%)]" />

      <div className="relative z-10 flex h-full min-h-0 flex-col">
        <RoomHeader roomId={roomId} />

        <section className="mx-auto grid w-full max-w-[1520px] min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden p-4 md:p-6 xl:grid-cols-[300px_1fr]">
          <RoomRightPanel roomId={roomId} />
          <RoomChatPanel roomId={roomId} />
        </section>
      </div>
    </main>
  );
}
