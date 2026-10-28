"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clonePublicTrip } from "@/features/trip-planning/api/public-trips";
import { GatewayApiError } from "@/features/trip-planning/api/gateway-request";

type PublicTripDetail = {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  budgetAmount: number;
  currency: string;
  days: readonly {
    id: string;
    date: string;
    dayIndex: number;
    stops: readonly { id: string; name: string; address: string }[];
  }[];
};

type TripDetailViewProps = { isAuthenticated: boolean; trip: PublicTripDetail };

export default function TripDetailView({
  isAuthenticated,
  trip,
}: TripDetailViewProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const clone = async () => {
    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(`/trip/${trip.id}`)}`);
      return;
    }

    try {
      setBusy(true);
      setError(undefined);
      const copy = await clonePublicTrip(trip.id, crypto.randomUUID());
      router.push(`/planner/${copy.id}`);
    } catch (cause) {
      setError(
        cause instanceof GatewayApiError
          ? cause.message
          : "Không thể tạo bản sao lúc này.",
      );
      setBusy(false);
    }
  };

  return (
    <div className="page-shell px-4 py-8 sm:px-6 sm:py-12">
      <Link href="/explore" className="focus-ring inline-flex min-h-11 items-center gap-2 rounded text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
        <ArrowLeft aria-hidden="true" className="size-4" /> Khám phá lộ trình
      </Link>

      <header className="mt-6 max-w-4xl">
        <h1 className="text-balance text-[clamp(32px,5vw,56px)] font-medium leading-[1.05] tracking-tight">{trip.title}</h1>
        <p className="mt-5 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
          {trip.description ?? "Chưa có mô tả cho lộ trình này."}
        </p>
        <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4 text-sm">
          <div>
            <dt className="text-muted-foreground">Thời gian</dt>
            <dd className="mt-0.5 text-base tabular-nums">
              {trip.startDate} – {trip.endDate}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Số ngày</dt>
            <dd className="mt-0.5 text-base">{trip.days.length} ngày trong lịch trình</dd>
          </div>
        </dl>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
        <article className="min-w-0">
          <h2 className="text-2xl font-medium tracking-tight">Lịch trình theo ngày</h2>
          <p className="mt-2 text-sm text-muted-foreground">Các điểm dừng công khai được sắp theo nhịp di chuyển của chuyến đi.</p>

          {trip.days.length === 0 ? (
            <div className="mt-8 rounded-xl border border-dashed border-border px-6 py-12 text-center">
              <p className="text-sm text-muted-foreground">Lộ trình này chưa có điểm dừng công khai.</p>
            </div>
          ) : (
            <ol className="mt-8 grid gap-10">
              {trip.days.map((day) => (
                <li key={day.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="text-xl font-medium">Ngày {day.dayIndex}</h3>
                    <p className="text-sm tabular-nums text-muted-foreground">{day.date}</p>
                  </div>
                  {day.stops.length === 0 ? (
                    <p className="mt-4 text-sm text-muted-foreground">Chưa có điểm dừng được công khai trong ngày này.</p>
                  ) : (
                    <ol className="mt-4 grid gap-1">
                      {day.stops.map((stop, index) => (
                        <li key={stop.id} className={`flex gap-4 rounded-lg px-5 py-4 ${index % 2 === 0 ? "bg-muted" : "bg-muted/50"}`}>
                          <span className="w-7 shrink-0 text-xl tabular-nums">{index + 1}</span>
                          <div className="min-w-0">
                            <h4 className="text-lg font-medium">{stop.name}</h4>
                            <p className="mt-0.5 text-sm text-muted-foreground">{stop.address}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                </li>
              ))}
            </ol>
          )}
        </article>

        <aside aria-labelledby="clone-trip-heading" className="h-fit rounded-xl bg-muted p-6 lg:sticky lg:top-24">
          <h2 id="clone-trip-heading" className="text-xl font-medium tracking-tight">
            Đưa cung đường này vào chuyến đi của bạn
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Bản sao được tạo dưới dạng hành trình riêng tư để bạn điều chỉnh điểm dừng, thời gian và ngân sách.
          </p>
          <p className="mt-5 text-sm text-muted-foreground">Ngân sách dự kiến</p>
          <p className="text-2xl font-medium tabular-nums tracking-tight">
            {trip.budgetAmount.toLocaleString("vi-VN")} {trip.currency}
          </p>
          {error && (
            <p role="alert" className="mt-4 text-sm text-destructive">
              {error}
            </p>
          )}
          <Button type="button" size="lg" disabled={busy} onClick={() => void clone()} className="mt-6 min-h-12 w-full">
            {busy ? "Đang tạo bản sao…" : isAuthenticated ? "Clone lộ trình" : "Đăng nhập để clone"}
            <ArrowRight aria-hidden="true" />
          </Button>
        </aside>
      </div>
    </div>
  );
}
