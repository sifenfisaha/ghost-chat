'use client';

import { Clock3Icon, ShieldCheckIcon, UserIcon } from 'lucide-react';

import { useRoomsStore } from '@/store/rooms-store';

type RoomHeaderProps = {
  roomId: string;
};

export function RoomHeader({ roomId }: RoomHeaderProps) {
  const room = useRoomsStore((state) => state.roomsById[roomId]);
  if (!room) return null;

  return (
    <header className="border-b border-border/60 px-4 py-3 md:px-6">
      <div className="mx-auto flex w-full max-w-[1520px] flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 text-primary ring-primary/40 flex size-8 items-center justify-center ring-1">
            <ShieldCheckIcon className="size-4" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-[0.12em] uppercase">
              {room.title}
            </p>
            <p className="text-primary text-[11px] tracking-[0.14em] uppercase">
              {room.sessionStatus}
            </p>
          </div>
        </div>

        <div className="border-border/70 bg-card/70 flex items-center gap-3 border px-4 py-2">
          <Clock3Icon className="text-primary size-4" />
          <p className="text-primary text-2xl leading-none font-semibold tabular-nums">
            {room.countdown}
          </p>
          <span className="text-muted-foreground text-[10px] tracking-[0.16em] uppercase">
            Remaining
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="border-border/70 bg-card/70 flex items-center gap-2 border px-3 py-2">
            <UserIcon className="size-3.5" />
            <span className="text-xs font-medium">{room.operator}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
