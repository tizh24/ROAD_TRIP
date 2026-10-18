"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarDays, Compass, Map, RefreshCw, Search, SlidersHorizontal } from "lucide-react";
import { listPublicTrips, type PublicTrip } from "@/features/trip-planning/api/public-trips";
import { GatewayApiError } from "@/features/trip-planning/api/gateway-request";

type BudgetTier = "all" | "low" | "medium" | "high";

function calculateDays(start: string, end: string): number {
  const diff = Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`);
  return Math.max(1, Math.round(diff / 86_400_000) + 1);
}

export default function ExploreView() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") ?? searchParams.get("destination") ?? "";
  const [trips, setTrips] = useState<readonly PublicTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [search, setSearch] = useState(queryParam);
  const [budgetTier, setBudgetTier] = useState<BudgetTier>("all");

  useEffect(() => {
    if (queryParam) {
      setSearch(queryParam);
    }
  }, [queryParam]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(undefined);
      setTrips(await listPublicTrips());
    } catch (e) {
      setError(e instanceof GatewayApiError ? e.message : "Không tải được lộ trình.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      if (search.trim()) {
        const query = search.trim().toLowerCase();
        const matchesTitle = trip.title.toLowerCase().includes(query);
        const matchesDesc = trip.description?.toLowerCase().includes(query) ?? false;
        if (!matchesTitle && !matchesDesc) return false;
      }

      if (budgetTier === "low" && trip.budgetAmount > 5_000_000) return false;
      if (budgetTier === "medium" && (trip.budgetAmount < 5_000_000 || trip.budgetAmount > 15_000_000)) return false;
      if (budgetTier === "high" && trip.budgetAmount < 15_000_000) return false;

      return true;
    });
  }, [trips, search, budgetTier]);

  return (
    <main className="min-h-[calc(100svh-72px)] bg-background pb-16">
      <header className="border-b border-border-main bg-surface px-4 py-8 sm:px-6">
        <div className="page-shell px-0">
          <p className="text-xs font-extrabold uppercase tracking-[.16em] text-primary">
            Khám phá lộ trình
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-[-.035em] sm:text-4xl text-text-main">
            Chọn một hướng đi để bắt đầu.
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-text-sub">
            Khám phá những cung đường thực tế được cộng đồng đóng góp. Bạn có thể clone bất kỳ lộ trình nào về tài khoản để tự do tùy biến.
          </p>

          {/* Search bar & quick filters */}
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-lg flex-1">
              <label htmlFor="explore-search" className="sr-only">
                Tìm lộ trình
              </label>
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-sub"
              />
              <input
                id="explore-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="field bg-background pl-11"
                placeholder="Tìm theo tên điểm đến, lộ trình..."
              />
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Lọc theo ngân sách">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-text-sub mr-1">
                <SlidersHorizontal size={14} /> Ngân sách:
              </span>
              {(
                [
                  ["all", "Tất cả"],
                  ["low", "< 5 triệu"],
                  ["medium", "5 - 15 triệu"],
                  ["high", "> 15 triệu"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setBudgetTier(key)}
                  className={`focus-ring rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                    budgetTier === key
                      ? "bg-primary text-white shadow-sm"
                      : "bg-surface-container-low text-text-sub hover:bg-background-warm hover:text-text-main"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <section className="page-shell px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-secondary">
            <Map size={17} className="text-primary" />
            <span>Lộ trình công khai ({filteredTrips.length})</span>
          </div>

          {(search || budgetTier !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setBudgetTier("all");
              }}
              className="focus-ring text-xs font-bold text-primary hover:underline"
            >
              Đặt lại bộ lọc
            </button>
          )}
        </div>

        {error && (
          <div className="surface-card my-6 border-red-200 bg-red-50/50 p-6 text-center">
            <p role="alert" className="text-sm font-bold text-error">
              {error}
            </p>
            <button
              type="button"
              onClick={() => void load()}
              className="focus-ring mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover"
            >
              <RefreshCw size={14} /> Thử lại
            </button>
          </div>
        )}

        {loading && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-60 animate-pulse rounded-2xl bg-surface-container-low"
              />
            ))}
          </div>
        )}

        {!loading && !error && filteredTrips.length === 0 && (
          <div className="surface-card my-8 p-10 text-center">
            <Compass className="mx-auto text-primary" size={36} />
            <h2 className="mt-4 text-lg font-extrabold text-text-main">
              {trips.length === 0
                ? "Chưa có lộ trình công khai nào"
                : "Không tìm thấy lộ trình phù hợp"}
            </h2>
            <p className="mt-2 text-sm text-text-sub">
              {trips.length === 0
                ? "Các chuyến đi được xuất bản công khai sẽ hiển thị tại đây để bạn khám phá và clone."
                : "Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh lại bộ lọc ngân sách."}
            </p>
            {trips.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setBudgetTier("all");
                }}
                className="focus-ring mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        )}

        {!loading && !error && filteredTrips.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredTrips.map((trip) => {
              const days = calculateDays(trip.startDate, trip.endDate);
              return (
                <Link
                  href={`/trip/${trip.id}`}
                  key={trip.id}
                  className="surface-card group flex flex-col justify-between p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover hover:border-primary/40"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                        <CalendarDays size={13} /> {days} ngày
                      </span>
                      <span className="text-xs font-medium text-text-sub">
                        {trip.startDate} – {trip.endDate}
                      </span>
                    </div>

                    <h2 className="mt-4 text-xl font-extrabold tracking-[-.02em] text-text-main group-hover:text-primary transition-colors">
                      {trip.title}
                    </h2>

                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-text-sub">
                      {trip.description ?? "Lộ trình khám phá tự do và trải nghiệm bản địa độc bản."}
                    </p>
                  </div>

                  <div className="mt-6 border-t border-border-light pt-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-text-sub">Dự toán ngân sách</p>
                      <p className="text-sm font-extrabold text-secondary">
                        {trip.budgetAmount.toLocaleString("vi-VN")} {trip.currency}
                      </p>
                    </div>

                    <span className="focus-ring inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
                      Chi tiết <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
