'use client';

import { SendIcon } from 'lucide-react';

import { useRoomsStore } from '@/store/rooms-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type RoomChatPanelProps = {
  roomId: string;
};

export function RoomChatPanel({ roomId }: RoomChatPanelProps) {
  const room = useRoomsStore((state) => state.roomsById[roomId]);
  const setComposerDraft = useRoomsStore((state) => state.setComposerDraft);
  const sendMessage = useRoomsStore((state) => state.sendMessage);
  if (!room) return null;

  return (
    <Card className="border-border/70 bg-card/70 flex h-full min-h-0 flex-col py-0">
      <CardHeader className="border-b border-border/60 px-4 py-3">
        <p className="text-primary bg-primary/10 border-primary/30 w-fit border px-2 py-1 text-[10px] tracking-[0.08em]">
          {room.systemBanner}
        </p>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col px-4 py-4">
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
          {room.messages.slice(0, 2).map((chat) => (
            <ChatBlock
              key={chat.id}
              author={chat.author}
              time={chat.time}
              message={chat.message}
              variant={chat.variant}
            />
          ))}

          <div className="text-warning-foreground bg-secondary border-border/60 w-fit border px-2 py-1 text-[10px] tracking-[0.08em] uppercase">
            {room.alert}
          </div>

          {room.messages.slice(2).map((chat) => (
            <ChatBlock
              key={chat.id}
              author={chat.author}
              time={chat.time}
              message={chat.message}
              variant={chat.variant}
            />
          ))}
        </div>

        <div className="mt-auto space-y-3 border-t border-border/60 pt-4">
          <div className="flex items-center gap-2">
            <Input
              value={room.composerDraft}
              onChange={(event) => setComposerDraft(roomId, event.target.value)}
              className="h-10 bg-background/70 text-sm"
              placeholder={room.composerPlaceholder}
            />
            <Button
              onClick={() => sendMessage(roomId)}
              size="icon"
              className="size-10"
            >
              <SendIcon className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ChatBlock({
  author,
  time,
  message,
  variant = 'default',
}: {
  author: string;
  time: string;
  message: string;
  variant?: 'default' | 'primary';
}) {
  return (
    <div className={`max-w-[78%] ${variant === 'primary' ? 'ml-auto' : ''}`}>
      <p className="text-muted-foreground mb-1 text-[10px]">
        {author} <span className="ml-1 tabular-nums">{time}</span>
      </p>
      <div
        className={`border px-4 py-3 text-sm leading-6 ${
          variant === 'primary'
            ? 'bg-primary text-primary-foreground border-primary/70'
            : 'bg-background/60 border-border/60'
        }`}
      >
        {message}
      </div>
    </div>
  );
}
