"use client";

import { FileIcon, FileKeyIcon, FileTextIcon, FolderIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RoomAssetKind } from "@/components/rooms/data";
import { useRoomsStore } from "@/store/rooms-store";

type RoomLeftPanelProps = {
  roomId: string;
};

export function RoomLeftPanel({ roomId }: RoomLeftPanelProps) {
  const room = useRoomsStore((state) => state.roomsById[roomId]);
  const toggleSecurityRule = useRoomsStore((state) => state.toggleSecurityRule);
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
              <span className="text-primary text-[10px] tabular-nums">{asset.ttl}</span>
            </div>
            <p className="text-muted-foreground text-[10px]">{asset.meta}</p>
          </div>
        ))}
      </CardContent>

      <div className="mt-auto border-t border-border/60 p-3">
        <p className="mb-2 text-xs tracking-[0.14em] uppercase">Security Enforcement</p>
        <div className="space-y-2">
          {room.securityRules.map((rule) => (
            <ToggleRow
              key={rule.id}
              label={rule.label}
              detail={rule.detail}
              enabled={rule.enabled}
              onToggle={() => toggleSecurityRule(roomId, rule.id)}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}

function ToggleRow({
  label,
  detail,
  enabled,
  onToggle,
}: {
  label: string;
  detail: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-border/50 bg-background/40 flex items-center justify-between border p-2">
      <div>
        <p className="text-xs">{label}</p>
        <p className="text-muted-foreground text-[10px]">{detail}</p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className={`relative inline-flex h-5 w-9 border ${
          enabled ? "bg-primary border-primary/60" : "bg-muted border-border"
        }`}
      >
        <span
          className={`bg-background absolute top-0.5 size-4 transition-transform ${
            enabled ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function AssetIcon({ kind }: { kind: RoomAssetKind }) {
  if (kind === "key") return <FileKeyIcon className="text-primary size-3.5" />;
  if (kind === "document") return <FileTextIcon className="text-primary size-3.5" />;
  return <FileIcon className="text-primary size-3.5" />;
}
