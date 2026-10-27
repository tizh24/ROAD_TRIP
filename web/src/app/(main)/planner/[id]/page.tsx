import TripEditorView from "@/features/trip-planning/components/TripEditorView";

export const metadata = { title: "Lịch trình" };

export default async function PlannerTripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TripEditorView tripId={id} />;
}
