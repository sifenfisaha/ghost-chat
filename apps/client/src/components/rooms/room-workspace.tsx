'use client';

import { useEffect, useRef, useState } from 'react';
import { XIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { RoomChatPanel } from '@/components/rooms/room-chat-panel';
import { RoomHeader } from '@/components/rooms/room-header';
import {
  RoomRightPanel,
  RoomSidebarContent,
} from '@/components/rooms/room-right-panel';
import { Button } from '@/components/ui/button';
import { useSocket } from '@/hooks/use-socket';
import { getRoomDetailRequest } from '@/lib/rooms-api';
import { ensureGuestSessionToken } from '@/lib/session-client';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  ensureRoom,
  hydrateRoomFromServer,
  setActiveRoom,
} from '@/store/features/rooms/rooms.slice';
import { joinSocketRoom } from '@/store/features/socket/socket.thunks';

type RoomWorkspaceProps = {
  roomId: string;
};

export function RoomWorkspace({ roomId }: RoomWorkspaceProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const joinedRoomIds = useAppSelector((state) => state.socket.joinedRoomIds);
  const [isMobileSidebarMounted, setIsMobileSidebarMounted] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const closeSidebarTimeoutRef = useRef<number | null>(null);

  const sessionQuery = useQuery({
    queryKey: ['guest-session'],
    queryFn: ensureGuestSessionToken,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const { isConnected } = useSocket({
    enabled: Boolean(roomId) && sessionQuery.isSuccess,
    autoConnect: true,
    disconnectOnUnmount: false,
  });

  const roomDetailQuery = useQuery({
    queryKey: ['room-detail', roomId],
    queryFn: () => getRoomDetailRequest(roomId),
    enabled: Boolean(roomId) && sessionQuery.isSuccess,
  });

  useEffect(() => {
    dispatch(ensureRoom(roomId));
    dispatch(setActiveRoom(roomId));
  }, [dispatch, roomId]);

  useEffect(() => {
    const room = roomDetailQuery.data?.room;
    if (!room) return;

    dispatch(hydrateRoomFromServer(room));
  }, [dispatch, roomDetailQuery.data?.room]);

  useEffect(() => {
    if (!roomDetailQuery.isError) return;
    router.replace('/rooms');
  }, [roomDetailQuery.isError, router]);

  useEffect(() => {
    if (!isConnected) return;
    if (joinedRoomIds.includes(roomId)) return;
    dispatch(joinSocketRoom(roomId));
  }, [dispatch, isConnected, joinedRoomIds, roomId]);

  // useEffect(() => {
  //   setIsMobileSidebarOpen(false);
  //   setIsMobileSidebarMounted(false);
  // }, [roomId]);

  useEffect(() => {
    return () => {
      if (closeSidebarTimeoutRef.current !== null) {
        window.clearTimeout(closeSidebarTimeoutRef.current);
      }
    };
  }, []);

  const openMobileSidebar = () => {
    if (closeSidebarTimeoutRef.current !== null) {
      window.clearTimeout(closeSidebarTimeoutRef.current);
      closeSidebarTimeoutRef.current = null;
    }
    setIsMobileSidebarMounted(true);
    requestAnimationFrame(() => {
      setIsMobileSidebarOpen(true);
    });
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
    closeSidebarTimeoutRef.current = window.setTimeout(() => {
      setIsMobileSidebarMounted(false);
      closeSidebarTimeoutRef.current = null;
    }, 220);
  };

  return (
    <main className="bg-background text-foreground relative h-dvh overflow-hidden">
      <div className="relative z-10 flex h-full min-h-0 flex-col">
        <RoomHeader roomId={roomId} onOpenSidebar={openMobileSidebar} />

        <section className="mx-auto grid w-full max-w-380 min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden p-4 md:p-6 xl:grid-cols-[300px_1fr]">
          <RoomRightPanel roomId={roomId} />
          <RoomChatPanel roomId={roomId} />
        </section>
      </div>

      {isMobileSidebarMounted ? (
        <div
          className="fixed inset-0 z-40 xl:hidden"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className={`absolute inset-0 bg-black/45 transition-opacity duration-200 ${
              isMobileSidebarOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={closeMobileSidebar}
            aria-label="Close room sidebar"
          />
          <aside
            className={`border-border/70 bg-background absolute top-0 right-0 h-full w-[min(24rem,88vw)] border-l p-3 transition-transform duration-200 ease-out ${
              isMobileSidebarOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="mb-3 flex items-center justify-end">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={closeMobileSidebar}
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
