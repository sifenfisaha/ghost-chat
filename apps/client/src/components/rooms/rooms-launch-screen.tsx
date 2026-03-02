'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FingerprintIcon, LockIcon, ShieldIcon, TimerIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  createPrivateSession,
  joinExistingRoom,
} from '@/store/features/rooms/rooms.slice';
import { useMutation } from '@tanstack/react-query';
import { useSocket } from '@/hooks/use-socket';

export function RoomsLaunchScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [roomIdInput, setRoomIdInput] = useState('');
  const firstRoomId = useAppSelector(
    (state) => state.rooms.roomOrder[0] ?? null
  );
  const { socket, isConnected } = useSocket();

  const handleCreate = () => {
    const roomId = dispatch(createPrivateSession()).payload;
    router.push(`/rooms/${roomId}`);
  };

  const handleJoin = () => {
    const roomId = roomIdInput.trim() || firstRoomId;
    if (!roomId) return;
    dispatch(joinExistingRoom(roomId));
    setRoomIdInput('');
    router.push(`/rooms/${roomId}`);
  };

  // create room
  const { mutate: createRoom, isPending: isCreatingRoom } = useMutation({
    mutationFn: async () => {
      const response = await fetch('http://localhost:4000/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error('Failed to create room');
      }
      return response.json();
    },
    onSuccess: (data) => {
      const { roomId } = data;
      dispatch(createPrivateSession());
      router.push(`/rooms/${roomId}`);
    },
    onError: () => {
      alert('Failed to create room. Please try again.');
    },
  });

  // join room

  const { mutate: joinRoom, isPending: isJoiningRoom } = useMutation({
    mutationFn: async (roomId: string) => {
      const response = await fetch('http://localhost:4000/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId }),
      });
      if (!response.ok) {
        throw new Error('Failed to join room');
      }
      return response.json();
    },
    onSuccess: (data) => {
      const { roomId } = data;
      dispatch(joinExistingRoom(roomId));
      setRoomIdInput('');
      router.push(`/rooms/${roomId}`);
    },
    onError: () => {
      alert('Failed to join room. Please check the room ID and try again.');
    },
  });

  const handleJoinClick = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleJoin();
  };
  const handleCreateClick = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createRoom();
  };

  return (
    <main className="bg-background text-foreground relative min-h-screen overflow-hidden">
      <header className="relative z-10 border-b border-border/50 px-6 py-5 md:px-10">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 text-primary ring-primary/40 flex size-8 items-center justify-center ring-1">
              <ShieldIcon className="size-4" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-[0.32em] text-foreground/90 uppercase">
                SEC-402-DELTA
              </p>
              <p className="text-muted-foreground text-[11px] tracking-[0.2em] uppercase">
                System Operational
              </p>
            </div>
          </div>

          <nav className="text-muted-foreground hidden items-center gap-8 text-[11px] tracking-[0.2em] uppercase sm:flex">
            <Link className="hover:text-foreground transition-colors" href="#">
              Docs
            </Link>
            <Link className="hover:text-foreground transition-colors" href="#">
              Security
            </Link>
            <Link className="hover:text-foreground transition-colors" href="#">
              API
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative z-10 flex min-h-[calc(100vh-136px)] items-center justify-center px-6 py-12">
        <Card className="w-full max-w-xl border-border/70 bg-card/80 py-0 backdrop-blur-md">
          <CardHeader className="px-8 pt-10 text-center">
            <div className="text-primary mx-auto mb-4 flex size-12 items-center justify-center border border-border bg-background/70">
              <FingerprintIcon className="size-6" />
            </div>
            <CardTitle className="text-3xl font-semibold tracking-tight">
              Initialize Secure Protocol
            </CardTitle>
            <CardDescription className="mx-auto mt-2 max-w-md text-sm leading-6">
              Establish an ephemeral, end-to-end encrypted communication
              channel. Room data self-destructs after 10 minutes.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 px-8 pb-8">
            <form onSubmit={handleCreateClick}>
              <Button
                type="submit"
                className="h-11 w-full text-[12px] tracking-[0.24em] uppercase"
              >
                {isCreatingRoom
                  ? 'Generating Private Session...'
                  : 'Generate Private Session'}
              </Button>
            </form>

            <div className="flex items-center gap-3">
              <div className="bg-border h-px flex-1" />
              <span className="text-muted-foreground text-[11px] tracking-[0.2em] uppercase">
                or
              </span>
              <div className="bg-border h-px flex-1" />
            </div>

            <form className="space-y-3" onSubmit={handleJoinClick}>
              <Input
                value={roomIdInput}
                onChange={(event) => setRoomIdInput(event.target.value)}
                placeholder="Enter room ID"
                aria-label="Room ID"
                className="h-10 px-3 text-sm"
              />
              <Button
                type="submit"
                variant="ghost"
                className="text-muted-foreground mx-auto flex h-auto w-auto gap-2 px-0 py-0 text-[11px] tracking-[0.2em] uppercase hover:bg-transparent hover:text-foreground"
              >
                Join Existing Room
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <footer className="relative z-10 border-t border-border/50 px-6 py-4 md:px-10">
        <div className="text-muted-foreground mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 text-[11px] tracking-[0.14em] uppercase">
          <div className="flex items-center gap-2">
            <LockIcon className="size-3.5" />
            <span>v2.4.6-stable</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-primary size-1.5 rounded-full" />
            <span>Status: Connected</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <LockIcon className="size-3.5" />
              AES-256-GCM Encryption
            </span>
            <span className="inline-flex items-center gap-1.5">
              <TimerIcon className="size-3.5" />
              10m Ephemerality
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
