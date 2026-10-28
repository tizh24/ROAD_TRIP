import Closing from "@/features/community/components/landing/Closing";
import Destinations from "@/features/community/components/landing/Destinations";
import FeaturesPinned from "@/features/community/components/landing/FeaturesPinned";
import Hero from "@/features/community/components/landing/Hero";
import HowItWorks from "@/features/community/components/landing/HowItWorks";
import PlannerDemo from "@/features/community/components/landing/PlannerDemo";
import PublicAgenda, { type AgendaTrip } from "@/features/community/components/landing/PublicAgenda";
import { gatewayPublic } from "@/lib/api/gateway-server";
import type { PublicTrip } from "@/features/trip-planning/api/public-trips";

async function latestPublicTrip(): Promise<AgendaTrip | null> {
  const list = await gatewayPublic<PublicTrip[]>("/public/trips");
  const latest = Array.isArray(list.data) ? list.data[0] : undefined;
  if (!latest) return null;
  const detail = await gatewayPublic<AgendaTrip>(`/public/trips/${encodeURIComponent(latest.id)}`);
  return detail.data && Array.isArray(detail.data.days) ? detail.data : null;
}

export default async function HomePage() {
  const trip = await latestPublicTrip();

  return (
    <>
      <Hero />
      <section aria-labelledby="demo-title" className="py-24 md:py-36">
        <div className="mx-auto w-full max-w-[88rem] px-6 md:px-12">
          <div className="reveal md:ml-[27%] md:max-w-[560px]">
            <h2 id="demo-title" className="text-[28px] font-medium leading-tight tracking-tight">
              Lập thử một chuyến đi.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Đổi phương tiện, số ngày hay giờ nghỉ và xem lịch trình cùng thời gian lái thay đổi ngay.
            </p>
          </div>
          <div className="reveal mt-10 md:ml-[27%] md:max-w-[740px]" style={{ "--i": 1 } as React.CSSProperties}>
            <PlannerDemo />
          </div>
        </div>
      </section>
      <Destinations />
      <FeaturesPinned />
      <HowItWorks />
      <PublicAgenda trip={trip} />
      <Closing />
    </>
  );
}
