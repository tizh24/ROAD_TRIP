"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  MapPin,
  Route,
  Wallet,
} from "lucide-react";
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
    <main className="min-h-[calc(100svh-72px)] overflow-x-clip bg-brand-offwhite pb-14 text-brand-charcoal sm:pb-20">
      <section className="bg-brand-charcoal px-4 pb-12 pt-9 text-white sm:px-6 sm:pb-16 sm:pt-12">
        <div className="page-shell px-0">
          <Link
            href="/explore"
            className="focus-ring inline-flex min-h-11 items-center gap-2 text-sm font-bold text-white/80 hover:text-white"
          >
            <ArrowLeft aria-hidden="true" size={18} /> Khám phá lộ trình
          </Link>
          <div className="mt-9 max-w-4xl">
            <h1 className="text-balance text-4xl font-extrabold tracking-[-.04em] sm:text-5xl lg:text-6xl">
              {trip.title}
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-sm leading-7 text-white/70 sm:text-base">
              {trip.description ?? "Chưa có mô tả cho lộ trình này."}
            </p>
          </div>
          <dl className="mt-9 flex flex-wrap gap-x-7 gap-y-3 border-t border-white/20 pt-5 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <CalendarDays
                aria-hidden="true"
                size={17}
                className="text-brand-orange"
              />
              <dt className="sr-only">Thời gian</dt>
              <dd>
                {trip.startDate} – {trip.endDate}
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <Route
                aria-hidden="true"
                size={17}
                className="text-brand-orange"
              />
              <dt className="sr-only">Số ngày</dt>
              <dd>{trip.days.length} ngày trong lịch trình</dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="page-shell grid gap-10 px-4 py-9 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14">
        <article className="min-w-0">
          <header className="border-b border-border-main pb-5">
            <h2 className="text-3xl font-extrabold tracking-[-.035em] text-brand-charcoal">
              Lịch trình theo ngày
            </h2>
            <p className="mt-2 text-sm leading-6 text-text-sub">
              Các điểm dừng công khai được sắp theo nhịp di chuyển của chuyến
              đi.
            </p>
          </header>

          {trip.days.length === 0 ? (
            <div className="border-b border-border-main py-10 text-center">
              <MapPin
                aria-hidden="true"
                className="mx-auto text-brand-orange"
                size={34}
              />
              <p className="mt-4 text-sm text-text-sub">
                Lộ trình này chưa có điểm dừng công khai.
              </p>
            </div>
          ) : (
            <ol className="mt-8 space-y-9">
              {trip.days.map((day, dayPosition) => (
                <li key={day.id} className="relative pl-8 sm:pl-11">
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-1 flex size-6 items-center justify-center rounded-full bg-primary-strong text-xs font-extrabold text-white sm:size-7"
                  >
                    {day.dayIndex}
                  </span>
                  {dayPosition < trip.days.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-[-2.25rem] left-[11px] top-8 w-px bg-border-main sm:left-[13px]"
                    />
                  )}
                  <div className="border-b border-border-main pb-8">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <h3 className="text-xl font-extrabold tracking-[-.025em] text-brand-charcoal">
                        Ngày {day.dayIndex}
                      </h3>
                      <p className="text-sm font-medium text-text-sub">
                        {day.date}
                      </p>
                    </div>
                    {day.stops.length === 0 ? (
                      <p className="mt-4 text-sm text-text-sub">
                        Chưa có điểm dừng được công khai trong ngày này.
                      </p>
                    ) : (
                      <ol className="mt-5 space-y-4">
                        {day.stops.map((stop, index) => (
                          <li
                            key={stop.id}
                            className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-3"
                          >
                            <span className="pt-0.5 text-sm font-extrabold tabular-nums text-primary">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <div>
                              <h4 className="font-bold text-brand-charcoal">
                                {stop.name}
                              </h4>
                              <p className="mt-1 text-sm leading-6 text-text-sub">
                                {stop.address}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </article>

        <aside
          aria-labelledby="clone-trip-heading"
          className="h-fit border-y border-border-main py-6 lg:sticky lg:top-24 lg:border-y-0 lg:border-l lg:pl-7"
        >
          <Wallet aria-hidden="true" size={24} className="text-brand-orange" />
          <h2
            id="clone-trip-heading"
            className="mt-4 text-2xl font-extrabold tracking-[-.03em] text-brand-charcoal"
          >
            Đưa cung đường này vào chuyến đi của bạn
          </h2>
          <p className="mt-3 text-sm leading-6 text-text-sub">
            Bản sao được tạo dưới dạng hành trình riêng tư để bạn điều chỉnh
            điểm dừng, thời gian và ngân sách.
          </p>
          <p className="mt-5 border-y border-border-main py-4 text-sm font-bold text-brand-charcoal">
            <span className="block text-xs font-bold uppercase tracking-[.12em] text-text-sub">
              Ngân sách dự kiến
            </span>
            <span className="mt-1 block tabular-nums">
              {trip.budgetAmount.toLocaleString("vi-VN")} {trip.currency}
            </span>
          </p>
          {error && (
            <p
              role="alert"
              className="mt-4 text-sm font-bold leading-6 text-error"
            >
              {error}
            </p>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={() => void clone()}
            className="focus-ring mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary-strong px-4 text-sm font-extrabold text-white transition-colors hover:bg-primary-strong/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy
              ? "Đang tạo bản sao…"
              : isAuthenticated
                ? "Clone lộ trình"
                : "Đăng nhập để clone"}
            <ArrowRight aria-hidden="true" size={17} />
          </button>
        </aside>
      </div>
    </main>
  );
}
