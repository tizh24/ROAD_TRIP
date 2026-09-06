import TripEditorView from "@/features/trip-planning/components/TripEditorView";

export default async function TripEditorPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  return <TripEditorView tripId={tripId} />;
}
