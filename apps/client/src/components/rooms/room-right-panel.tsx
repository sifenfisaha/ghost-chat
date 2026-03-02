'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckIcon, CopyIcon, UsersIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/store/hooks';

type RoomRightPanelProps = {
  roomId: string;
};

export function RoomRightPanel({ roomId }: RoomRightPanelProps) {
  return (
    <RoomSidebarContent
      roomId={roomId}
      className="hidden h-full min-h-0 flex-col gap-4 overflow-y-auto pr-1 xl:flex"
    />
  );
}

type RoomSidebarContentProps = {
  roomId: string;
  className?: string;
};

export function RoomSidebarContent({
  roomId,
  className,
}: RoomSidebarContentProps) {
  const [copied, setCopied] = useState(false);
  const copiedTimeoutRef = useRef<number | null>(null);
  const room = useAppSelector((state) => state.rooms.roomsById[roomId]);

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current !== null) {
        window.clearTimeout(copiedTimeoutRef.current);
      }
    };
  }, []);

  const handleCopyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      if (copiedTimeoutRef.current !== null) {
        window.clearTimeout(copiedTimeoutRef.current);
      }
      copiedTimeoutRef.current = window.setTimeout(() => {
        setCopied(false);
        copiedTimeoutRef.current = null;
      }, 1000);
    } catch {
      setCopied(false);
    }
  };

  if (!room) return null;

  const activeUsersCount = room.users.filter((user) => user.active).length;

  return (
    <div
      className={cn(
        'flex h-full min-h-0 flex-col gap-4 overflow-y-auto pr-1',
        className
      )}
    >
      <Card className="border-border/70 bg-card/70 flex min-h-0 flex-col py-0">
        <CardHeader className="border-b border-border/60 px-4 py-3">
          <CardTitle className="text-xs tracking-[0.14em] uppercase">
            Room Info
          </CardTitle>
        </CardHeader>
        <CardContent className="min-h-0 overflow-y-auto space-y-3 px-4 py-4 text-xs">
          <div className="border-border/60 bg-background/40 border p-2">
            <p className="text-muted-foreground mb-1 text-[10px] uppercase">
              Session ID
            </p>
            <div className="flex items-center justify-between gap-2">
              <p className="text-primary font-medium">{roomId}</p>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={handleCopyRoomId}
                aria-label="Copy room ID"
              >
                {copied ? (
                  <CheckIcon className="text-primary size-3.5" />
                ) : (
                  <CopyIcon className="size-3.5" />
                )}
              </Button>
            </div>
          </div>
          <InfoRow label="Encryption" value={room.encryption} />
          <InfoRow label="Auto-Destruct" value={room.autoDestruct} />
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/70 flex min-h-0 flex-1 flex-col py-0">
        <CardHeader className="border-b border-border/60 px-4 py-3">
          <CardTitle className="flex items-center justify-between text-xs tracking-[0.14em] uppercase">
            <span>Active Users ({activeUsersCount})</span>
            <UsersIcon className="size-3.5" />
          </CardTitle>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 overflow-y-auto space-y-2 px-4 py-4">
          {room.users.map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <p className="text-xs">{user.name}</p>
              <span
                className={`text-[10px] ${user.active ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {user.state}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/70 flex min-h-0 flex-1 flex-col py-0">
        <CardHeader className="border-b border-border/60 px-4 py-3">
          <CardTitle className="flex items-center justify-between text-xs tracking-[0.14em] uppercase">
            <span>System Logs</span>
            <span className="text-primary text-[10px]">Live</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 overflow-y-auto space-y-2 px-4 py-4">
          {room.logs.map((log) => (
            <p key={log.id} className="text-muted-foreground text-[11px]">
              <span className="mr-1.5 text-[10px] tabular-nums text-foreground/70">
                [{log.time}]
              </span>
              {log.message}
            </p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-muted-foreground">{label}</p>
      <p className="text-primary">{value}</p>
    </div>
  );
}
