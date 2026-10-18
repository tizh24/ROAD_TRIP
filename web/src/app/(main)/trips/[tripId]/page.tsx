import { redirect } from "next/navigation";

export default async function TripEditorPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  redirect(`/planner/${encodeURIComponent(tripId)}`);
}
