"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CalendarDays, Plus, Users } from "lucide-react";
import { GatewayApiError } from "@/features/trip-planning/api/gateway-request";
import { listTrips } from "@/features/trip-planning/api/trips";
import type { TripListItem } from "@/features/trip-planning/api/trip-model";
import FeedbackState from "@/components/ui/FeedbackState";
import PageHeader from "@/components/ui/PageHeader";

type LoadState =
  | { kind: "loading" }
  | { kind: "content"; trips: readonly TripListItem[] }
  | { kind: "error"; message: string };

const statusLabels: Record<TripListItem["status"], string> = {
  PLANNING: "Đang lên kế hoạch",
  ONGOING: "Đang diễn ra",
  COMPLETED: "Đã hoàn thành",
  CANCELLED: "Đã hủy",
};

function formatDateRange(startDate: string, endDate: string) {
  const formatter = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
  return `${formatter.format(new Date(`${startDate}T00:00:00Z`))} – ${formatter.format(new Date(`${endDate}T00:00:00Z`))}`;
}

function errorMessage(error: unknown) {
  if (error instanceof GatewayApiError) {
    if (error.code === "AUTH_REQUIRED") return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
    return error.message;
  }
  return "Không thể tải các chuyến đi lúc này. Vui lòng thử lại.";
}

export default function TripListView() {
  const [state, setState] = useState<LoadState>({ kind: "loading" });

  const load = useCallback(async () => {
    setState({ kind: "loading" });
    try {
      setState({ kind: "content", trips: await listTrips() });
    } catch (error) {
      setState({ kind: "error", message: errorMessage(error) });
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  return (
    <section className="page-shell w-full py-10 sm:py-14" aria-labelledby="trips-heading">
      <PageHeader eyebrow="Không gian lập kế hoạch" title="Chuyến đi của bạn" description="Tạo, theo dõi và tiếp tục chỉnh sửa mọi lịch trình road trip của bạn." actions={<Link href="/trips/new" className="focus-ring inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-card smooth-transition hover:bg-primary-hover">
          <Plus size={18} aria-hidden="true" /> Tạo chuyến đi
        </Link>} />
      <div className="mt-10">

      {state.kind === "loading" && <TripListLoading />}
      {state.kind === "error" && <TripListError message={state.message} onRetry={load} />}
      {state.kind === "content" && state.trips.length === 0 && <TripListEmpty />}
      {state.kind === "content" && state.trips.length > 0 && <TripList trips={state.trips} />}
      </div>
    </section>
  );
}

function TripListLoading() {
  return <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Đang tải chuyến đi" aria-busy="true">{[0, 1, 2].map((index) => <div key={index} className="h-52 animate-pulse rounded-2xl border border-gray-100 bg-white" />)}</div>;
}

function TripListError({ message, onRetry }: { message: string; onRetry: () => void }) { return <FeedbackState kind="error" title="Không tải được chuyến đi" description={message} actionLabel="Thử lại" onAction={onRetry} />; }

function TripListEmpty() { return <FeedbackState kind="empty" title="Chưa có chuyến đi nào" description="Bắt đầu một lịch trình để lưu điểm dừng, ngày đi và kế hoạch của cả nhóm."><Link href="/trips/new" className="focus-ring inline-flex rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary-hover">Tạo chuyến đi đầu tiên</Link></FeedbackState>; }

function TripList({ trips }: { trips: readonly TripListItem[] }) {
  return <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Danh sách chuyến đi">{trips.map((trip) => <li key={trip.id}><Link href={`/trips/${trip.id}`} className="group block h-full rounded-2xl border border-gray-200 bg-white p-6 shadow-card transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card-hover"><div className="flex items-start justify-between gap-3"><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{statusLabels[trip.status]}</span><span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500"><Users size={14} aria-hidden="true" />{trip.role === "OWNER" ? "Chủ chuyến đi" : trip.permission === "EDIT" ? "Thành viên · Có thể chỉnh sửa" : "Thành viên · Chỉ xem"}</span></div><h2 className="mt-7 text-xl font-bold text-gray-900 group-hover:text-primary">{trip.title}</h2><p className="mt-4 flex items-center gap-2 text-sm text-gray-600"><CalendarDays size={16} aria-hidden="true" />{formatDateRange(trip.startDate, trip.endDate)}</p><span className="mt-7 inline-block text-sm font-bold text-primary">Mở lịch trình <span aria-hidden="true">→</span></span></Link></li>)}</ul>;
}
