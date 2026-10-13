import { redirect } from "next/navigation";

export default async function PlannerTripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/trips/${encodeURIComponent(id)}`);
}
