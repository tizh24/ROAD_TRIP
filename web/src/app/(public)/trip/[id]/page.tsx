import TripDetailView from '@/features/trip-planning/components/TripDetailView';
import { gatewayCurrentSession, gatewayPublic } from '@/lib/api/gateway-server';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [session, trip] = await Promise.all([
    gatewayCurrentSession(),
    gatewayPublic<{ id: string; title: string; description: string | null; startDate: string; endDate: string; budgetAmount: number; currency: string; days: readonly { id: string; date: string; dayIndex: number; stops: readonly { id: string; name: string; address: string }[] }[] }>(`/public/trips/${encodeURIComponent(id)}`),
  ]);
  if (!trip.data) notFound();

  return <TripDetailView isAuthenticated={Boolean(session.data)} trip={trip.data} />;
}
