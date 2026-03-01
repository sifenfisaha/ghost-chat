'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FingerprintIcon, LockIcon, ShieldIcon, TimerIcon } from 'lucide-react';

import { useRoomsStore } from '@/store/rooms-store';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function RoomsLaunchScreen() {
  const router = useRouter();
  const landing = useRoomsStore((state) => state.landing);
  const createPrivateSession = useRoomsStore(
    (state) => state.createPrivateSession
  );
  const joinExistingRoom = useRoomsStore((state) => state.joinExistingRoom);

  const handleCreate = () => {
    const roomId = createPrivateSession();
    router.push(`/rooms/${roomId}`);
  };

  const handleJoin = () => {
    const roomId = joinExistingRoom();
    if (!roomId) return;
    router.push(`/rooms/${roomId}`);
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
                {landing.title}
              </p>
              <p className="text-muted-foreground text-[11px] tracking-[0.2em] uppercase">
                {landing.status}
              </p>
            </div>
          </div>

          <nav className="text-muted-foreground hidden items-center gap-8 text-[11px] tracking-[0.2em] uppercase sm:flex">
            {landing.navItems.map((item) => (
              <Link
                key={item}
                className="hover:text-foreground transition-colors"
                href="#"
              >
                {item}
              </Link>
            ))}
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
              {landing.protocolTitle}
            </CardTitle>
            <CardDescription className="mx-auto mt-2 max-w-md text-sm leading-6">
              {landing.protocolDescription}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 px-8 pb-8">
            <Button
              onClick={handleCreate}
              className="h-11 w-full text-[12px] tracking-[0.24em] uppercase"
            >
              {landing.generateButton}
            </Button>
            <Button
              onClick={handleJoin}
              variant="ghost"
              className="text-muted-foreground mx-auto flex h-auto w-auto gap-2 px-0 py-0 text-[11px] tracking-[0.2em] uppercase hover:bg-transparent hover:text-foreground"
            >
              {landing.joinButton}
            </Button>
          </CardContent>
        </Card>
      </section>

      <footer className="relative z-10 border-t border-border/50 px-6 py-4 md:px-10">
        <div className="text-muted-foreground mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 text-[11px] tracking-[0.14em] uppercase">
          <div className="flex items-center gap-2">
            <LockIcon className="size-3.5" />
            <span>{landing.footerVersion}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-primary size-1.5 rounded-full" />
            <span>{landing.footerStatus}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <LockIcon className="size-3.5" />
              {landing.footerEncryption}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <TimerIcon className="size-3.5" />
              {landing.footerEphemerality}
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
