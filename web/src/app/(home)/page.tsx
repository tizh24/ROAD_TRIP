import {
  Destinations,
  Hero,
  PlanSteps,
  ValueList,
} from "@/features/community/components/landing/LandingSections";
import NewsletterPanel from "@/features/community/components/landing/NewsletterPanel";
import { gatewayPublic } from "@/lib/api/gateway-server";
import type { PublicTrip } from "@/features/trip-planning/api/public-trips";

export default async function HomePage() {
  const result = await gatewayPublic<PublicTrip[]>("/public/trips");
  const liveTrip = Array.isArray(result.data) ? result.data[0] : undefined;

  return (
    <>
      <Hero />
      <ValueList />
      <Destinations />
      <PlanSteps liveTrip={liveTrip} />
      <NewsletterPanel />
    </>
  );
}
