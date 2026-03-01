'use client';

import { FileIcon, FileKeyIcon, FileTextIcon, FolderIcon } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRoomsStore } from '@/store/rooms-store';
import type { RoomAssetKind } from '@/types/rooms';

type RoomLeftPanelProps = {
  roomId: string;
};

export function RoomLeftPanel({ roomId }: RoomLeftPanelProps) {
  const room = useRoomsStore((state) => state.roomsById[roomId]);
  if (!room) return null;

  return (
    <Card className="border-border/70 bg-card/70 py-0">
      <CardHeader className="border-b border-border/60 px-4 py-3">
        <CardTitle className="flex items-center justify-between text-xs tracking-[0.14em] uppercase">
          <span className="inline-flex items-center gap-2">
            <FolderIcon className="size-3.5" />
            Session Assets
          </span>
          <span className="text-primary bg-primary/10 border-primary/30 border px-1.5 py-0.5 text-[10px]">
            Active
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-3 py-3">
        {room.assets.map((asset) => (
          <div
            key={asset.id}
            className="border-border/60 hover:border-primary/40 bg-background/50 space-y-2 border p-3 transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="flex items-center gap-2 text-xs font-medium">
                <AssetIcon kind={asset.kind} />
                {asset.name}
              </p>
              <span className="text-primary text-[10px] tabular-nums">
                {asset.ttl}
              </span>
            </div>
            <p className="text-muted-foreground text-[10px]">{asset.meta}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function AssetIcon({ kind }: { kind: RoomAssetKind }) {
  if (kind === 'key') return <FileKeyIcon className="text-primary size-3.5" />;
  if (kind === 'document')
    return <FileTextIcon className="text-primary size-3.5" />;
  return <FileIcon className="text-primary size-3.5" />;
}
