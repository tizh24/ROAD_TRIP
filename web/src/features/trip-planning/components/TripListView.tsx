"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import FeedbackState from "@/components/ui/FeedbackState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { GatewayApiError } from "@/features/trip-planning/api/gateway-request";
import { listTrips } from "@/features/trip-planning/api/trips";
import type { TripListItem } from "@/features/trip-planning/api/trip-model";
import {
  TRIP_PAGE_SIZE,
  countByStatus,
  selectTrips,
  todayIso,
  type SortOrder,
  type StatusFilter,
} from "@/features/trip-planning/api/trip-list-model";

type State =
  | { kind: "loading" }
  | { kind: "content"; trips: readonly TripListItem[] }
  | { kind: "error"; message: string };

const statusLabels: Record<TripListItem["status"], string> = {
  PLANNING: "Sắp tới",
  ONGOING: "Đang trên đường",
  COMPLETED: "Đã hoàn thành",
  CANCELLED: "Đã hủy",
};

const statusFilters: { id: StatusFilter; label: string }[] = [
  { id: "ALL", label: "Tất cả" },
  { id: "ONGOING", label: "Đang trên đường" },
  { id: "PLANNING", label: "Sắp tới" },
  { id: "COMPLETED", label: "Đã hoàn thành" },
];

const formatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

function formatDateRange(startDate: string, endDate: string): string {
  try {
    const start = formatter.format(new Date(`${startDate}T00:00:00Z`));
    const end = formatter.format(new Date(`${endDate}T00:00:00Z`));
    return `${start} – ${end}`;
  } catch {
    return `${startDate} – ${endDate}`;
  }
}

function getTripDurationDays(startDate: string, endDate: string): number {
  const s = new Date(`${startDate}T00:00:00Z`).getTime();
  const e = new Date(`${endDate}T00:00:00Z`).getTime();
  const days = Math.round((e - s) / 86_400_000) + 1;
  return Number.isFinite(days) && days > 0 ? days : 1;
}

function getMemberRoleText(role: TripListItem["role"], permission: TripListItem["permission"]): string {
  if (role === "OWNER") return "Chủ hành trình";
  return permission === "EDIT" ? "Có thể chỉnh sửa" : "Chỉ xem";
}

/** Ledger of the traveler's trips: counts as type, one row per trip, no cards. */
export default function TripListView() {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [sortOrder, setSortOrder] = useState<SortOrder>("NEAREST");
  const [pageState, setPageState] = useState({ key: "", size: TRIP_PAGE_SIZE });

  const load = useCallback(async () => {
    setState({ kind: "loading" });
    try {
      const trips = await listTrips();
      setState({ kind: "content", trips });
    } catch (error) {
      setState({
        kind: "error",
        message: error instanceof GatewayApiError ? error.message : "Không thể tải các chuyến đi lúc này.",
      });
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);

  const trips = state.kind === "content" ? state.trips : null;
  const count = (status: StatusFilter) => (trips ? countByStatus(trips, status) : 0);

  const filteredTrips = useMemo(
    () => (trips ? selectTrips(trips, { status: statusFilter, query: searchQuery, sort: sortOrder, today: todayIso() }) : []),
    [trips, statusFilter, searchQuery, sortOrder],
  );
  // A new filter, search or sort starts again from the first page.
  const pageKey = `${statusFilter}|${searchQuery}|${sortOrder}`;
  const pageSize = pageState.key === pageKey ? pageState.size : TRIP_PAGE_SIZE;
  const visibleTrips = filteredTrips.slice(0, pageSize);

  return (
    <div className="page-shell px-4 py-8 sm:px-6 sm:py-10">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-medium tracking-tight">Chuyến đi của bạn</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Mọi lịch trình, điểm dừng và bạn đồng hành của bạn nằm ở đây.
          </p>
        </div>
        <Button asChild size="lg" className="min-h-11 self-start sm:self-auto">
          <Link href="/planner/new">
            <Plus aria-hidden="true" /> Tạo chuyến đi mới
          </Link>
        </Button>
      </header>

      {trips && trips.length > 0 && (
        <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
          {statusFilters.map((item) => (
            <div key={item.id}>
              <dt className="text-sm text-muted-foreground">{item.id === "ALL" ? "Tổng hành trình" : item.label}</dt>
              <dd className="mt-1 text-4xl font-medium tabular-nums tracking-tight">{count(item.id)}</dd>
            </div>
          ))}
        </dl>
      )}

      <section aria-labelledby="trip-list-title" className="mt-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="trip-list-title" className="text-lg font-medium">
            Hành trình của bạn
            {trips && <span className="ml-2 text-sm font-normal text-muted-foreground tabular-nums">{filteredTrips.length}</span>}
          </h2>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                type="text"
                aria-label="Tìm chuyến đi"
                placeholder="Tìm chuyến đi"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 pl-9 pr-10"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="focus-ring absolute right-1 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:text-foreground"
                  aria-label="Xóa tìm kiếm"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              onClick={() => setSortOrder((prev) => (prev === "NEAREST" ? "NEWEST" : "NEAREST"))}
              title="Đổi thứ tự sắp xếp"
            >
              {sortOrder === "NEAREST" ? "Khởi hành gần nhất" : "Mới nhất"}
            </Button>
          </div>
        </div>

        {trips && trips.length > 0 && (
          <div role="group" aria-label="Lọc theo trạng thái" className="mt-4 flex flex-wrap gap-2">
            {statusFilters.map((item) => (
              <Button
                key={item.id}
                type="button"
                size="sm"
                variant={statusFilter === item.id ? "default" : "outline"}
                aria-pressed={statusFilter === item.id}
                className="min-h-9"
                onClick={() => setStatusFilter(item.id)}
              >
                {item.label}
                <span className="tabular-nums opacity-70">{count(item.id)}</span>
              </Button>
            ))}
          </div>
        )}

        {state.kind === "loading" && <TripListSkeleton />}

        {state.kind === "error" && (
          <div className="mt-8">
            <FeedbackState kind="error" title="Không tải được hành trình" description={state.message} actionLabel="Thử lại" onAction={load} />
          </div>
        )}

        {state.kind === "content" && state.trips.length === 0 && <EmptyTripState />}

        {state.kind === "content" && state.trips.length > 0 && filteredTrips.length === 0 && (
          <div className="mt-8 flex flex-col items-center rounded-xl border border-dashed border-border px-6 py-12 text-center">
            <h3 className="text-lg font-medium">Không tìm thấy chuyến đi phù hợp</h3>
            <p className="mt-2 text-sm text-muted-foreground">Kiểm tra lại từ khóa hoặc chọn trạng thái khác.</p>
            <Button
              type="button"
              variant="outline"
              className="mt-5 min-h-11"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("ALL");
              }}
            >
              Xóa bộ lọc
            </Button>
          </div>
        )}

        {state.kind === "content" && filteredTrips.length > 0 && (
          <>
            <ul className="mt-4 grid gap-1">
              {visibleTrips.map((trip, index) => (
                <TripRow key={trip.id} trip={trip} striped={index % 2 === 0} />
              ))}
            </ul>
            {filteredTrips.length > visibleTrips.length && (
              <div className="mt-4 flex flex-col items-center gap-2">
                <p className="text-sm tabular-nums text-muted-foreground" role="status">
                  Đang hiển thị {visibleTrips.length} / {filteredTrips.length} chuyến đi
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11"
                  onClick={() => setPageState({ key: pageKey, size: pageSize + TRIP_PAGE_SIZE })}
                >
                  Xem thêm
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function TripRow({ trip, striped }: { trip: TripListItem; striped: boolean }) {
  const days = getTripDurationDays(trip.startDate, trip.endDate);
  return (
    <li className={`rounded-lg ${striped ? "bg-muted" : "bg-muted/50"}`}>
      <Link
        href={`/planner/${trip.id}`}
        className="focus-ring grid min-h-[76px] items-center gap-x-6 gap-y-1 rounded-lg px-5 py-3 transition-colors hover:bg-border/60 md:grid-cols-[minmax(0,1fr)_220px_150px_90px]"
      >
        <span className="min-w-0">
          <span className="block truncate text-base font-medium">{trip.title}</span>
          <span className="block truncate text-sm text-muted-foreground">{getMemberRoleText(trip.role, trip.permission)}</span>
        </span>
        <span className="text-sm tabular-nums text-muted-foreground">{formatDateRange(trip.startDate, trip.endDate)}</span>
        <StatusLabel status={trip.status} />
        <span className="text-sm tabular-nums md:text-right">{days} ngày</span>
      </Link>
    </li>
  );
}

function StatusLabel({ status }: { status: TripListItem["status"] }) {
  const tone = status === "ONGOING" ? "text-success" : status === "CANCELLED" ? "text-muted-foreground line-through" : "text-foreground";
  return (
    <span className={`inline-flex items-center gap-2 text-sm ${tone}`}>
      {status === "ONGOING" && <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />}
      {statusLabels[status]}
    </span>
  );
}

function EmptyTripState() {
  return (
    <div className="mt-8 flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-12 text-center">
      <h3 className="text-2xl font-medium tracking-tight">Chưa có chuyến đi nào.</h3>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        Thêm điểm dừng, chia theo ngày và mời bạn đồng hành. Chuyến đầu tiên chỉ mất vài phút để lên lịch.
      </p>
      <Button asChild size="lg" className="mt-7 min-h-11">
        <Link href="/planner/new">
          <Plus aria-hidden="true" /> Tạo chuyến đi mới
        </Link>
      </Button>
    </div>
  );
}

function TripListSkeleton() {
  return (
    <div className="mt-4 grid gap-1" aria-busy="true" aria-label="Đang tải danh sách chuyến đi">
      {[1, 2, 3, 4].map((item) => (
        <Skeleton key={item} className="h-[76px] rounded-lg" />
      ))}
    </div>
  );
}
