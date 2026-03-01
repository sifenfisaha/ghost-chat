"use client";

import { useRoomsStore } from "@/store/rooms-store";

type RoomFooterProps = {
  roomId: string;
};

export function RoomFooter({ roomId }: RoomFooterProps) {
  const room = useRoomsStore((state) => state.roomsById[roomId]);
  if (!room) return null;

  return (
    <footer className="border-t border-border/60 px-4 py-2 md:px-6">
      <div className="text-muted-foreground mx-auto flex w-full max-w-[1520px] items-center justify-between text-[10px] tracking-widest uppercase">
        <span>{room.footerLatency}</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="bg-primary size-1.5 rounded-full" />
          {room.footerStatus}
        </span>
        <span>{room.footerVersion}</span>
      </div>
    </footer>
  );
}
