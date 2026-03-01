import { RoomWorkspace } from '@/components/rooms/room-workspace';

type RoomPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function RoomDetailPage({ params }: RoomPageProps) {
  const { id } = await params;
  return <RoomWorkspace roomId={id} />;
}
