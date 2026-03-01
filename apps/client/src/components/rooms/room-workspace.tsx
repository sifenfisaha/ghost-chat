'use client';

import { useEffect, useState } from 'react';
import { XIcon } from 'lucide-react';

import { useRoomsStore } from '@/store/rooms-store';
import { RoomChatPanel } from '@/components/rooms/room-chat-panel';
import { RoomHeader } from '@/components/rooms/room-header';
import {
  RoomRightPanel,
  RoomSidebarContent,
} from '@/components/rooms/room-right-panel';
import { Button } from '@/components/ui/button';
import { useSocket } from '@/hooks/use-socket';

type RoomWorkspaceProps = {
  roomId: string;
};

export function RoomWorkspace({ roomId }: RoomWorkspaceProps) {
  const ensureRoom = useRoomsStore((state) => state.ensureRoom);
  const setActiveRoom = useRoomsStore((state) => state.setActiveRoom);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useSocket({
    enabled: Boolean(roomId),
    autoConnect: true,
    disconnectOnUnmount: false,
  });

  useEffect(() => {
    ensureRoom(roomId);
    setActiveRoom(roomId);
  }, [ensureRoom, roomId, setActiveRoom]);

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [roomId]);

  return (
    <main className="bg-background text-foreground relative h-screen overflow-hidden">
      <div className="relative z-10 flex h-full min-h-0 flex-col">
        <RoomHeader
          roomId={roomId}
          onOpenSidebar={() => setIsMobileSidebarOpen(true)}
        />

        <section className="mx-auto grid w-full max-w-380 min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden p-4 md:p-6 xl:grid-cols-[300px_1fr]">
          <RoomRightPanel roomId={roomId} />
          <RoomChatPanel roomId={roomId} />
        </section>
      </div>

      {isMobileSidebarOpen ? (
        <div
          className="fixed inset-0 z-40 xl:hidden"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-label="Close room sidebar"
          />
          <aside className="border-border/70 bg-background absolute top-0 right-0 h-full w-[min(24rem,88vw)] border-l p-3">
            <div className="mb-3 flex items-center justify-end">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => setIsMobileSidebarOpen(false)}
                aria-label="Close room sidebar"
              >
                <XIcon className="size-4" />
              </Button>
            </div>
            <RoomSidebarContent roomId={roomId} className="pr-0" />
          </aside>
        </div>
      ) : null}
    </main>
  );
}
