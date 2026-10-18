import LandingPage from '@/features/community/components/LandingPage';
import { gatewayPublic } from '@/lib/api/gateway-server';
import type { PublicTrip } from '@/features/trip-planning/api/public-trips';

export default async function Page() {
  const result = await gatewayPublic<PublicTrip[]>('/public/trips');
  return <LandingPage liveTrips={result.data ?? []} />;
}
