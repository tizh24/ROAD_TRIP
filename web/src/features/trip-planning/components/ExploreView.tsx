"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  Compass,
  Map,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Wallet,
} from "lucide-react";
import {
  listPublicTrips,
  type PublicTrip,
} from "@/features/trip-planning/api/public-trips";
import { GatewayApiError } from "@/features/trip-planning/api/gateway-request";

type BudgetTier = "all" | "low" | "medium" | "high";

const budgetTiers: ReadonlyArray<{ key: BudgetTier; label: string }> = [
  { key: "all", label: "Tất cả" },
  { key: "low", label: "Dưới 5 triệu" },
  { key: "medium", label: "5 – 15 triệu" },
  { key: "high", label: "Trên 15 triệu" },
];

function calculateDays(start: string, end: string): number {
  const diff =
    Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`);
  return Math.max(1, Math.round(diff / 86_400_000) + 1);
}

export default function ExploreView() {
  const searchParams = useSearchParams();
  const queryParam =
    searchParams.get("q") ?? searchParams.get("destination") ?? "";
  const [trips, setTrips] = useState<readonly PublicTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [search, setSearch] = useState(queryParam);
  const [budgetTier, setBudgetTier] = useState<BudgetTier>("all");

  useEffect(() => {
    if (queryParam) {
      const timer = window.setTimeout(() => setSearch(queryParam), 0);
      return () => window.clearTimeout(timer);
    }
  }, [queryParam]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(undefined);
      setTrips(await listPublicTrips());
    } catch (cause) {
      setError(
        cause instanceof GatewayApiError
          ? cause.message
          : "Không tải được lộ trình.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const filteredTrips = useMemo(
    () =>
      trips.filter((trip) => {
        if (search.trim()) {
          const query = search.trim().toLowerCase();
          if (
            !trip.title.toLowerCase().includes(query) &&
            !(trip.description?.toLowerCase().includes(query) ?? false)
          )
            return false;
        }
        if (budgetTier === "low" && trip.budgetAmount > 5_000_000) return false;
        if (
          budgetTier === "medium" &&
          (trip.budgetAmount < 5_000_000 || trip.budgetAmount > 15_000_000)
        )
          return false;
        if (budgetTier === "high" && trip.budgetAmount < 15_000_000)
          return false;
        return true;
      }),
    [budgetTier, search, trips],
  );

  const resetFilters = () => {
    setSearch("");
    setBudgetTier("all");
  };
  const hasActiveFilters = Boolean(search) || budgetTier !== "all";

  return (
    <div className="min-h-[calc(100svh-72px)] overflow-x-clip bg-brand-offwhite pb-14 text-brand-charcoal sm:pb-20">
      <header className="border-b border-border-main bg-brand-offwhite px-4 pb-9 pt-10 sm:px-6 sm:pb-12 sm:pt-16">
        <div className="page-shell px-0">
          <div className="max-w-3xl">
            <h1 className="text-balance text-4xl font-extrabold tracking-[-.04em] text-brand-charcoal sm:text-5xl lg:text-6xl">
              Chọn một hướng đi để bắt đầu.
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-sm leading-7 text-text-sub sm:text-base">
              Những cung đường thực tế do cộng đồng Tripz chia sẻ. Lưu một lộ
              trình về tài khoản để tùy chỉnh theo nhịp đi của riêng bạn.
            </p>
          </div>

          <div className="mt-8 border-y border-border-main py-4 sm:mt-10 sm:flex sm:items-end sm:gap-6">
            <div className="min-w-0 flex-1">
              <label
                htmlFor="explore-search"
                className="mb-2 block text-sm font-bold text-brand-charcoal"
              >
                Tìm điểm đến hoặc cung đường
              </label>
              <div className="relative">
                <Search
                  aria-hidden="true"
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary"
                />
                <input
                  id="explore-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="field min-h-12 border-border-main bg-surface py-3 pl-11 text-brand-charcoal placeholder:text-text-sub"
                  placeholder="Hà Giang, biển miền Trung, đèo..."
                />
              </div>
            </div>
            <fieldset className="mt-5 min-w-0 sm:mt-0 sm:max-w-xl">
              <legend className="mb-2 flex items-center gap-2 text-sm font-bold text-brand-charcoal">
                <SlidersHorizontal aria-hidden="true" size={16} /> Ngân sách
              </legend>
              <div className="flex flex-wrap gap-2">
                {budgetTiers.map(({ key, label }) => {
                  const active = budgetTier === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setBudgetTier(key)}
                      className={`focus-ring min-h-11 rounded-full border px-3.5 text-sm font-bold transition-colors ${active ? "border-brand-orange bg-primary-strong text-white" : "border-border-main bg-surface text-text-sub hover:border-brand-orange hover:text-brand-charcoal"}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>
        </div>
      </header>

      <section className="page-shell px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border-main pb-4">
          <div className="flex items-center gap-2 text-sm font-bold text-brand-charcoal">
            <Map aria-hidden="true" size={18} className="text-brand-orange" />
            <span>Lộ trình công khai</span>
            {!loading && <span className="text-text-sub">({filteredTrips.length})</span>}
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="focus-ring min-h-11 text-sm font-bold text-primary-strong underline decoration-primary/40 underline-offset-4 hover:text-primary-strong/80"
            >
              Đặt lại bộ lọc
            </button>
          )}
        </div>

        {error && (
          <div className="my-8 border border-error/25 bg-surface px-5 py-7 sm:px-7">
            <p role="alert" className="text-sm font-bold text-error">
              {error}
            </p>
            <button
              type="button"
              onClick={() => void load()}
              className="focus-ring mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary-strong px-4 text-sm font-bold text-white hover:bg-primary-strong/90"
            >
              <RefreshCw aria-hidden="true" size={16} /> Thử lại
            </button>
          </div>
        )}

        {loading && (
          <div
            className="grid gap-px overflow-hidden border border-border-main bg-border-main md:grid-cols-2"
            aria-busy="true"
            aria-label="Đang tải lộ trình"
          >
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-64 animate-pulse bg-surface sm:h-72"
              />
            ))}
          </div>
        )}

        {!loading && !error && filteredTrips.length === 0 && (
          <div className="my-10 border-y border-border-main py-12 text-center sm:py-16">
            <Compass
              aria-hidden="true"
              className="mx-auto text-brand-orange"
              size={38}
            />
            <h2 className="mt-5 text-2xl font-extrabold tracking-[-.03em] text-brand-charcoal">
              {trips.length === 0
                ? "Chưa có lộ trình công khai nào"
                : "Không tìm thấy lộ trình phù hợp"}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-text-sub">
              {trips.length === 0
                ? "Các chuyến đi được xuất bản công khai sẽ xuất hiện ở đây để bạn khám phá và clone."
                : "Hãy thử một từ khóa khác hoặc điều chỉnh khoảng ngân sách."}
            </p>
            {trips.length > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="focus-ring mt-6 inline-flex min-h-11 items-center rounded-lg bg-primary-strong px-4 text-sm font-bold text-white hover:bg-primary-strong/90"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        )}

        {!loading && !error && filteredTrips.length > 0 && (
          <div className="grid gap-px overflow-hidden border border-border-main bg-border-main md:grid-cols-2">
            {filteredTrips.map((trip) => {
              const days = calculateDays(trip.startDate, trip.endDate);
              return (
                <Link
                  href={`/trip/${trip.id}`}
                  key={trip.id}
                  className="group focus-ring flex min-h-72 flex-col bg-surface p-5 transition-colors hover:bg-background-warm sm:p-7"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="inline-flex items-center gap-2 border-b-2 border-brand-orange pb-2 text-sm font-bold text-brand-charcoal">
                      <CalendarDays aria-hidden="true" size={16} /> {days} ngày
                    </span>
                    <span className="text-right text-xs font-medium leading-5 text-text-sub">
                      {trip.startDate} – {trip.endDate}
                    </span>
                  </div>
                  <h2 className="mt-7 text-2xl font-extrabold tracking-[-.035em] text-brand-charcoal transition-colors group-hover:text-primary sm:text-3xl">
                    {trip.title}
                  </h2>
                  <p className="mt-3 line-clamp-3 max-w-xl text-sm leading-6 text-text-sub">
                    {trip.description ??
                      "Lộ trình khám phá tự do và trải nghiệm bản địa."}
                  </p>
                  <div className="mt-auto flex items-end justify-between gap-4 border-t border-border-main pt-5">
                    <div>
                      <p className="flex items-center gap-1.5 text-xs font-bold text-text-sub">
                        <Wallet aria-hidden="true" size={14} /> Dự toán ngân
                        sách
                      </p>
                      <p className="mt-1 text-sm font-extrabold tabular-nums text-brand-charcoal">
                        {trip.budgetAmount.toLocaleString("vi-VN")}{" "}
                        {trip.currency}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-primary-strong transition-transform group-hover:translate-x-1">
                      Xem lộ trình <ArrowUpRight aria-hidden="true" size={17} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
