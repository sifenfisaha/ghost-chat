import { RoomWorkspace } from "@/components/rooms/room-workspace";

type RoomPageProps = {
  params: {
    id: string;
  };
};

export default function RoomDetailPage({ params }: RoomPageProps) {
  return <RoomWorkspace roomId={params.id} />;
}
