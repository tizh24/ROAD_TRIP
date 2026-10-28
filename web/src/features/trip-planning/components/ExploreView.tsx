"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowUpRight, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
    <div className="page-shell px-4 py-10 sm:px-6 sm:py-16">
      <header>
        <h1 className="max-w-3xl text-balance text-[clamp(32px,5vw,56px)] font-medium leading-[1.05] tracking-tight">
          Chọn một hướng đi để bắt đầu.
        </h1>
        <p className="mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
          Những cung đường thực tế do cộng đồng Tripz chia sẻ. Lưu một lộ trình về tài khoản để tùy chỉnh theo nhịp đi của riêng bạn.
        </p>

        <div className="mt-8 grid gap-6 sm:mt-10 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <div className="min-w-0">
            <label htmlFor="explore-search" className="mb-2 block text-sm font-medium">
              Tìm điểm đến hoặc cung đường
            </label>
            <div className="relative">
              <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="explore-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-12 pl-10"
                placeholder="Hà Giang, biển miền Trung, đèo..."
              />
            </div>
          </div>
          <fieldset className="min-w-0">
            <legend className="mb-2 text-sm font-medium">Ngân sách</legend>
            <div className="flex flex-wrap gap-2">
              {budgetTiers.map(({ key, label }) => (
                <Button
                  key={key}
                  type="button"
                  variant={budgetTier === key ? "default" : "outline"}
                  aria-pressed={budgetTier === key}
                  onClick={() => setBudgetTier(key)}
                  className="min-h-11"
                >
                  {label}
                </Button>
              ))}
            </div>
          </fieldset>
        </div>
      </header>

      <section className="mt-12" aria-labelledby="explore-results">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="explore-results" className="text-lg font-medium">
            Lộ trình công khai
            {!loading && <span className="ml-2 text-sm font-normal tabular-nums text-muted-foreground">{filteredTrips.length}</span>}
          </h2>
          {hasActiveFilters && (
            <Button type="button" variant="link" onClick={resetFilters} className="min-h-11 px-0">
              Đặt lại bộ lọc
            </Button>
          )}
        </div>

        {error && (
          <div className="rounded-xl bg-muted px-5 py-7 sm:px-7">
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
            <Button type="button" onClick={() => void load()} className="mt-5 min-h-11">
              <RefreshCw aria-hidden="true" /> Thử lại
            </Button>
          </div>
        )}

        {loading && (
          <div className="grid gap-1" aria-busy="true" aria-label="Đang tải lộ trình">
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} className="h-28 rounded-lg" />
            ))}
          </div>
        )}

        {!loading && !error && filteredTrips.length === 0 && (
          <div className="flex flex-col items-center rounded-xl border border-dashed border-border px-6 py-14 text-center">
            <h2 className="text-2xl font-medium tracking-tight">
              {trips.length === 0 ? "Chưa có lộ trình công khai nào" : "Không tìm thấy lộ trình phù hợp"}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {trips.length === 0
                ? "Các chuyến đi được xuất bản công khai sẽ xuất hiện ở đây để bạn khám phá và clone."
                : "Hãy thử một từ khóa khác hoặc điều chỉnh khoảng ngân sách."}
            </p>
            {trips.length > 0 && (
              <Button type="button" onClick={resetFilters} className="mt-6 min-h-11">
                Xóa bộ lọc
              </Button>
            )}
          </div>
        )}

        {!loading && !error && filteredTrips.length > 0 && (
          <ul className="grid gap-1">
            {filteredTrips.map((trip, index) => {
              const days = calculateDays(trip.startDate, trip.endDate);
              return (
                <li key={trip.id} className={`rounded-lg ${index % 2 === 0 ? "bg-muted" : "bg-muted/50"}`}>
                  <Link
                    href={`/trip/${trip.id}`}
                    className="focus-ring grid gap-x-8 gap-y-2 rounded-lg px-5 py-5 transition-colors hover:bg-border/60 md:grid-cols-[minmax(0,1fr)_200px_auto] md:items-center"
                  >
                    <span className="min-w-0">
                      <span className="block text-xl font-medium tracking-tight">{trip.title}</span>
                      <span className="mt-1 line-clamp-2 block max-w-xl text-sm leading-relaxed text-muted-foreground">
                        {trip.description ?? "Lộ trình khám phá tự do và trải nghiệm bản địa."}
                      </span>
                    </span>
                    <span className="text-sm tabular-nums">
                      <span className="block">{days} ngày</span>
                      <span className="block text-muted-foreground">
                        {trip.startDate} – {trip.endDate}
                      </span>
                      <span className="mt-1 block text-muted-foreground">
                        Dự toán {trip.budgetAmount.toLocaleString("vi-VN")} {trip.currency}
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-medium">
                      Xem lộ trình <ArrowUpRight aria-hidden="true" className="size-4" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
