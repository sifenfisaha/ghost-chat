'use client';

import { useEffect, useRef } from 'react';
import { SendIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  clearComposerDraft,
  setComposerDraft,
} from '@/store/features/rooms/rooms.slice';
import {
  sendSocketMessage,
  sendSocketTyping,
} from '@/store/features/socket/socket.thunks';

type RoomChatPanelProps = {
  roomId: string;
};

export function RoomChatPanel({ roomId }: RoomChatPanelProps) {
  const dispatch = useAppDispatch();
  const room = useAppSelector((state) => state.rooms.roomsById[roomId]);
  const typingUserIds = useAppSelector(
    (state) => state.socket.typingByRoom[roomId] ?? []
  );
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, [room?.messages.length]);

  if (!room) return null;

  const typingNames = typingUserIds
    .map((userId) => room.users.find((user) => user.id === userId)?.name)
    .filter((name): name is string => Boolean(name));

  const typingLabel =
    typingNames.length === 0
      ? null
      : typingNames.length === 1
        ? `${typingNames[0]} is typing...`
        : `${typingNames.join(', ')} are typing...`;

  const handleSendMessage = () => {
    const text = room.composerDraft.trim();
    if (!text) return;

    dispatch(sendSocketMessage(roomId, text));
    dispatch(sendSocketTyping(roomId, false));
    dispatch(clearComposerDraft(roomId));
  };

  return (
    <Card className="border-border/70 bg-card/70 flex h-full min-h-0 flex-col py-0">
      <CardHeader className="border-b border-border/60 px-4 py-3">
        <p className="text-primary bg-primary/10 border-primary/30 w-fit border px-2 py-1 text-[10px] tracking-[0.08em]">
          {room.systemBanner}
        </p>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col px-4 py-4">
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
          {room.alert ? (
            <ChatBlock
              author="System"
              time=""
              message={room.alert}
              variant="system"
            />
          ) : null}

          {room.messages.map((chat) => (
            <ChatBlock
              key={chat.id}
              author={chat.author}
              time={chat.time}
              message={chat.message}
              variant={chat.variant}
            />
          ))}

          <div ref={messagesEndRef} />
        </div>

        <div className="mt-auto space-y-3 border-t border-border/60 pt-4">
          {typingLabel ? (
            <p className="text-muted-foreground text-[11px]">{typingLabel}</p>
          ) : null}
          <div className="flex items-center gap-2">
            <Input
              value={room.composerDraft}
              onChange={(event) => {
                const draft = event.target.value;
                dispatch(setComposerDraft({ roomId, draft }));
                dispatch(sendSocketTyping(roomId, draft.trim().length > 0));
              }}
              onBlur={() => dispatch(sendSocketTyping(roomId, false))}
              onKeyDown={(event) => {
                if (event.key !== 'Enter') return;
                event.preventDefault();
                handleSendMessage();
              }}
              className="h-10 bg-background/70 text-sm"
              placeholder={room.composerPlaceholder}
              autoComplete="off"
            />
            <Button onClick={handleSendMessage} size="icon" className="size-10">
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
  variant?: 'default' | 'primary' | 'system';
}) {
  if (variant === 'system') {
    return (
      <div className="mx-auto w-full max-w-[70%] text-center">
        <div className="text-warning-foreground bg-secondary/80 border-border/60 inline-block border px-2 py-0.5 text-[10px] leading-5">
          {message}
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-[78%] ${variant === 'primary' ? 'ml-auto' : ''}`}>
      <p className="text-muted-foreground mb-1 text-[10px]">
        {author}
        {time ? <span className="ml-1 tabular-nums">{time}</span> : null}
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
