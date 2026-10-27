import RoadTripView from "@/features/trip-planning/components/RoadTripView";

export const metadata = { title: "Chế độ đi đường" };

export default async function RoadTripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RoadTripView tripId={id} />;
}
