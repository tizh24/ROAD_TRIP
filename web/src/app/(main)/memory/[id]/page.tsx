import TripMemoryView from '@/features/trip-memory/components/TripMemoryView';

export const metadata = { title: "Kỷ niệm chuyến đi" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TripMemoryView tripId={id} />;
}
