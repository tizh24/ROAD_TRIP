import RoadTripView from "@/features/trip-planning/components/RoadTripView";

export default async function RoadTripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RoadTripView tripId={id} />;
}
