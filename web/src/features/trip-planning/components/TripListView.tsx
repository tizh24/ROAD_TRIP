"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Compass,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import FeedbackState from "@/components/ui/FeedbackState";
import { GatewayApiError } from "@/features/trip-planning/api/gateway-request";
import { listTrips } from "@/features/trip-planning/api/trips";
import type { TripListItem } from "@/features/trip-planning/api/trip-model";

type State =
  | { kind: "loading" }
  | { kind: "content"; trips: readonly TripListItem[] }
  | { kind: "error"; message: string };

type StatusFilter = "ALL" | TripListItem["status"];
type SortOrder = "NEAREST" | "NEWEST";

const statusLabels: Record<TripListItem["status"], string> = {
  PLANNING: "Sắp tới",
  ONGOING: "Đang trên đường",
  COMPLETED: "Đã hoàn thành",
  CANCELLED: "Đã hủy",
};

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
  try {
    const s = new Date(`${startDate}T00:00:00Z`).getTime();
    const e = new Date(`${endDate}T00:00:00Z`).getTime();
    const days = Math.round((e - s) / 86_400_000) + 1;
    return days > 0 ? days : 1;
  } catch {
    return 1;
  }
}

function getMemberRoleText(
  role: TripListItem["role"],
  permission: TripListItem["permission"],
): string {
  if (role === "OWNER") return "Chủ hành trình";
  return permission === "EDIT" ? "Có thể chỉnh sửa" : "Chỉ xem";
}

export default function TripListView() {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [sortOrder, setSortOrder] = useState<SortOrder>("NEAREST");

  const load = useCallback(async () => {
    setState({ kind: "loading" });
    try {
      const trips = await listTrips();
      setState({ kind: "content", trips });
    } catch (error) {
      setState({
        kind: "error",
        message:
          error instanceof GatewayApiError
            ? error.message
            : "Không thể tải các chuyến đi lúc này.",
      });
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);

  const trips = state.kind === "content" ? state.trips : null;

  // Client-side filtering & sorting
  const filteredTrips = useMemo(() => {
    if (!trips) return [];

    let list = [...trips];

    if (statusFilter !== "ALL") {
      list = list.filter((t) => t.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((t) => t.title.toLowerCase().includes(q));
    }

    list.sort((a, b) => {
      const timeA = new Date(`${a.startDate}T00:00:00Z`).getTime();
      const timeB = new Date(`${b.startDate}T00:00:00Z`).getTime();
      return sortOrder === "NEAREST" ? timeA - timeB : timeB - timeA;
    });

    return list;
  }, [trips, statusFilter, searchQuery, sortOrder]);

  return (
    <div className="min-h-screen bg-background pb-20 text-foreground">
      {/* Editorial Header Section */}
      <section className="border-b border-border/70 bg-gradient-to-b from-muted/40 via-background to-background">
        <div className="page-shell px-4 py-10 sm:px-6 sm:py-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-primary">
                <Compass size={14} className="stroke-[2.5]" aria-hidden="true" />
                <span>Sổ tay hành trình</span>
              </div>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Sẵn sàng cho chặng tiếp theo.
              </h1>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                Tất cả cung đường phượt Việt Nam, điểm dừng chân và người đồng hành của bạn được lưu giữ trọn vẹn tại đây.
              </p>
            </div>

            <div className="shrink-0">
              <Link
                href="/planner/new"
                className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-xs transition-all duration-200 hover:bg-primary/90 hover:shadow-sm active:scale-[0.98] sm:w-auto"
              >
                <Plus size={18} className="stroke-[2.5]" aria-hidden="true" />
                <span>Tạo chuyến đi mới</span>
              </Link>
            </div>
          </div>

          {/* Dynamic Summary Stats derived strictly from real loaded trips */}
          {trips && trips.length > 0 && (
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              <StatCounter
                label="Tổng hành trình"
                count={trips.length}
                description="chuyến đã lên"
              />
              <StatCounter
                label="Đang trên đường"
                count={trips.filter((t) => t.status === "ONGOING").length}
                highlight={trips.some((t) => t.status === "ONGOING")}
                description="đang lăn bánh"
              />
              <StatCounter
                label="Sắp tới"
                count={trips.filter((t) => t.status === "PLANNING").length}
                description="chờ xuất phát"
              />
              <StatCounter
                label="Đã hoàn thành"
                count={trips.filter((t) => t.status === "COMPLETED").length}
                description="kỷ niệm đã lưu"
              />
            </div>
          )}
        </div>
      </section>

      {/* Main Content Area */}
      <section className="page-shell px-4 py-8 sm:px-6 sm:py-10">
        {/* Controls Toolbar: Search, Filter, Sort */}
        <div className="flex flex-col gap-4 border-b border-border/70 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-extrabold tracking-tight text-foreground">
              Hành trình của bạn
            </h2>
            {trips && (
              <span className="rounded-full border border-border/60 bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground">
                {filteredTrips.length}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                type="text"
                aria-label="Tìm chuyến đi"
                placeholder="Tìm chuyến đi"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="field w-full rounded-xl border-border bg-card pl-9 pr-8 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="focus-ring absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                  aria-label="Xóa tìm kiếm"
                >
                  <X size={14} aria-hidden="true" />
                </button>
              )}
            </div>

            {/* Sort Toggle */}
            <button
              type="button"
              onClick={() =>
                setSortOrder((prev) => (prev === "NEAREST" ? "NEWEST" : "NEAREST"))
              }
              className="focus-ring inline-flex h-[44px] items-center justify-center rounded-xl border border-border bg-card px-3.5 text-xs font-bold text-foreground shadow-xs transition hover:bg-muted/50"
              title="Đổi thứ tự sắp xếp"
            >
              {sortOrder === "NEAREST" ? "Khởi hành gần nhất" : "Mới nhất"}
            </button>
          </div>
        </div>

        {/* Status Filter Chips */}
        {trips && trips.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 pt-1">
            <FilterChip
              active={statusFilter === "ALL"}
              onClick={() => setStatusFilter("ALL")}
              label="Tất cả"
              count={trips.length}
            />
            <FilterChip
              active={statusFilter === "ONGOING"}
              onClick={() => setStatusFilter("ONGOING")}
              label="Đang trên đường"
              count={trips.filter((t) => t.status === "ONGOING").length}
            />
            <FilterChip
              active={statusFilter === "PLANNING"}
              onClick={() => setStatusFilter("PLANNING")}
              label="Sắp tới"
              count={trips.filter((t) => t.status === "PLANNING").length}
            />
            <FilterChip
              active={statusFilter === "COMPLETED"}
              onClick={() => setStatusFilter("COMPLETED")}
              label="Đã hoàn thành"
              count={trips.filter((t) => t.status === "COMPLETED").length}
            />
          </div>
        )}

        {/* State: Loading Skeleton */}
        {state.kind === "loading" && <TripListSkeleton />}

        {/* State: Error */}
        {state.kind === "error" && (
          <div className="mt-8">
            <FeedbackState
              kind="error"
              title="Không tải được hành trình"
              description={state.message}
              actionLabel="Thử lại"
              onAction={load}
            />
          </div>
        )}

        {/* State: Content with 0 total trips (Empty State) */}
        {state.kind === "content" && state.trips.length === 0 && (
          <EmptyTripState />
        )}

        {/* State: Content with trips but 0 matches after filter/search */}
        {state.kind === "content" &&
          state.trips.length > 0 &&
          filteredTrips.length === 0 && (
            <div className="mt-8 rounded-2xl border border-border bg-card p-8 text-center shadow-xs sm:p-12">
              <Search
                size={32}
                className="mx-auto text-muted-foreground/60"
                aria-hidden="true"
              />
              <h3 className="mt-4 text-lg font-bold text-foreground">
                Không tìm thấy chuyến đi phù hợp
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Hãy thử kiểm tra lại từ khóa tìm kiếm hoặc chọn lọc theo trạng thái khác.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("ALL");
                }}
                className="focus-ring mt-5 inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/60 px-4 py-2 text-xs font-bold text-foreground hover:bg-muted"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}

        {/* State: Content with matching trips */}
        {state.kind === "content" && filteredTrips.length > 0 && (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {filteredTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function TripCard({ trip }: { trip: TripListItem }) {
  const roleText = getMemberRoleText(trip.role, trip.permission);
  const durationDays = getTripDurationDays(trip.startDate, trip.endDate);
  const dateRangeText = formatDateRange(trip.startDate, trip.endDate);

  return (
    <article className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-all duration-300 hover:border-primary/40 hover:shadow-sm">
      {/* Top Banner / Card Cover with Travel Ambience */}
      <div className="relative flex h-28 flex-col justify-between bg-primary p-4 text-white sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <StatusBadge status={trip.status} />
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-sm">
            <ShieldCheck size={12} className="text-primary" aria-hidden="true" />
            <span>{roleText}</span>
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-white/90">
          <CalendarDays size={14} className="shrink-0 text-primary" aria-hidden="true" />
          <span className="truncate">{dateRangeText}</span>
          <span className="text-white/40">·</span>
          <span className="shrink-0 font-semibold">{durationDays} ngày</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-foreground transition-colors group-hover:text-primary line-clamp-2">
            <Link
              href={`/planner/${trip.id}`}
              className="focus-ring rounded outline-none hover:underline"
            >
              {trip.title}
            </Link>
          </h3>

          <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-border/60 bg-background p-3 text-xs">
            <MetricItem label="Vai trò" value={roleText} />
            <MetricItem label="Lịch trình" value={statusLabels[trip.status]} />
            <MetricItem label="Thời lượng" value={`${durationDays} ngày`} />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4">
          <Link
            href={`/planner/${trip.id}`}
            className="focus-ring inline-flex items-center gap-2 text-sm font-bold text-primary transition-colors hover:text-primary"
          >
            <span>Mở bản kế hoạch</span>
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
          <span className="text-[11px] font-medium text-muted-foreground">
            v{trip.version}
          </span>
        </div>
      </div>
    </article>
  );
}

function StatusBadge({ status }: { status: TripListItem["status"] }) {
  if (status === "ONGOING") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-200 backdrop-blur-sm">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" aria-hidden="true" />
        <span>{statusLabels[status]}</span>
      </span>
    );
  }
  if (status === "COMPLETED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-card/20 px-2.5 py-1 text-xs font-semibold text-stone-200 backdrop-blur-sm">
        <span>{statusLabels[status]}</span>
      </span>
    );
  }
  if (status === "CANCELLED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-card/10 px-2.5 py-1 text-xs font-semibold text-stone-300 backdrop-blur-sm">
        <span>{statusLabels[status]}</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-card/20 px-2.5 py-1 text-xs font-bold text-amber-200 backdrop-blur-sm">
      <span>{statusLabels[status]}</span>
    </span>
  );
}

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="overflow-hidden">
      <p className="truncate text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 truncate font-bold text-foreground">{value}</p>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`focus-ring inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
        active
          ? "bg-primary text-white shadow-xs"
          : "border border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
      }`}
    >
      <span>{label}</span>
      {typeof count === "number" && (
        <span
          className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
            active ? "bg-card/20 text-white" : "bg-muted text-muted-foreground"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function StatCounter({
  label,
  count,
  description,
  highlight,
}: {
  label: string;
  count: number;
  description: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-card/90 p-3.5 shadow-xs backdrop-blur-xs sm:p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="mt-1 flex items-baseline gap-2">
        <span
          className={`text-2xl font-extrabold sm:text-3xl ${
            highlight ? "text-primary" : "text-foreground"
          }`}
        >
          {count}
        </span>
        <span className="hidden text-[11px] text-muted-foreground sm:inline">
          {description}
        </span>
      </div>
    </div>
  );
}

function EmptyTripState() {
  return (
    <div className="mt-8 overflow-hidden rounded-3xl border border-dashed border-border bg-gradient-to-b from-white via-background to-muted/30 p-8 text-center shadow-xs sm:p-14">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner ring-8 ring-primary/5">
        <Compass size={38} className="stroke-[1.75]" aria-hidden="true" />
      </div>

      <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.2em] text-primary">
        Hành trình bắt đầu từ đây
      </p>

      <h3 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
        Những cung đường Việt Nam đang vẫy gọi.
      </h3>

      <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Từ những khúc cua Mã Pí Lèng hùng vĩ giữa mây ngàn, cung đường ven biển lộng gió Nam Trung Bộ, đến vẻ đẹp hoang sơ của đất trời Tây Nguyên... Mọi chuyến đi để đời đều bắt đầu từ một lịch trình được chuẩn bị chu đáo.
      </p>

      {/* Vietnam route inspiration chips */}
      <div className="mt-7 flex flex-wrap items-center justify-center gap-2 text-xs text-foreground/80">
        <span className="inline-flex items-center gap-1 font-semibold text-muted-foreground">
          <MapPin size={13} className="text-primary" aria-hidden="true" /> Gợi ý cung phượt:
        </span>
        <span className="rounded-full border border-border bg-card px-3 py-1 font-medium shadow-xs">
          🏔️ Đèo Mã Pí Lèng · Hà Giang Loop
        </span>
        <span className="rounded-full border border-border bg-card px-3 py-1 font-medium shadow-xs">
          🌊 Cung đường ven biển Vĩnh Hy · Phan Rang
        </span>
        <span className="rounded-full border border-border bg-card px-3 py-1 font-medium shadow-xs">
          🌲 Đèo Ô Quy Hồ · Hoàng Liên Sơn
        </span>
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          href="/planner/new"
          className="focus-ring inline-flex items-center gap-2.5 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-xs transition-all duration-200 hover:bg-primary/90 hover:shadow-sm active:scale-[0.98]"
        >
          <Plus size={18} className="stroke-[2.5]" aria-hidden="true" />
          <span>Tạo chuyến đi mới</span>
        </Link>
      </div>
    </div>
  );
}

function TripListSkeleton() {
  return (
    <div
      className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
      aria-busy="true"
      aria-label="Đang tải danh sách chuyến đi"
    >
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xs animate-pulse"
        >
          <div className="h-28 bg-muted/70" />
          <div className="space-y-4 p-5">
            <div className="h-6 w-3/4 rounded-md bg-stone-200" />
            <div className="grid grid-cols-3 gap-2 rounded-xl bg-background p-3">
              <div className="h-8 rounded bg-stone-200" />
              <div className="h-8 rounded bg-stone-200" />
              <div className="h-8 rounded bg-stone-200" />
            </div>
            <div className="flex items-center justify-between border-t border-border/40 pt-4">
              <div className="h-4 w-28 rounded bg-stone-200" />
              <div className="h-4 w-8 rounded bg-stone-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
