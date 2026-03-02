'use client';

import {
  Clock3Icon,
  PanelRightOpenIcon,
  ShieldCheckIcon,
  UserIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/store/hooks';

type RoomHeaderProps = {
  roomId: string;
  onOpenSidebar?: () => void;
};

export function RoomHeader({ roomId, onOpenSidebar }: RoomHeaderProps) {
  const room = useAppSelector((state) => state.rooms.roomsById[roomId]);
  if (!room) return null;

  return (
    <header className="border-b border-border/60 px-4 py-3 md:px-6">
      <div className="mx-auto flex w-full max-w-380 flex-nowrap items-center justify-between gap-2 md:flex-wrap md:gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 text-primary ring-primary/40 flex size-8 items-center justify-center ring-1">
            <ShieldCheckIcon className="size-4" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold tracking-[0.12em] uppercase">
              {room.title}
            </p>
            <p className="text-primary text-[11px] tracking-[0.14em] uppercase">
              {room.sessionStatus}
            </p>
          </div>
        </div>

        <div className="border-border/70 bg-card/70 flex items-center gap-2 border p-2 md:gap-3 md:px-4 md:py-2">
          <Clock3Icon className="text-primary hidden size-4 md:block" />
          <p className="text-primary text-sm leading-none font-semibold tabular-nums md:text-2xl">
            {room.countdown}
          </p>
          <span className="text-muted-foreground hidden text-[10px] tracking-[0.16em] uppercase md:block">
            Remaining
          </span>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="xl:hidden"
            onClick={onOpenSidebar}
            aria-label="Open room sidebar"
          >
            <PanelRightOpenIcon className="size-4" />
          </Button>
          <div className="border-border/70 bg-card/70 md:flex hidden items-center gap-2 border p-2 md:px-3 md:py-2">
            <UserIcon className="size-3.5" />
            <span className="hidden text-xs font-medium md:inline">
              {room.operator}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
