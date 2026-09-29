"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CalendarDays, CircleAlert, Map, Plus, RefreshCw, Users } from "lucide-react";
import { GatewayApiError } from "@/features/trip-planning/api/gateway-request";
import { listTrips } from "@/features/trip-planning/api/trips";
import type { TripListItem } from "@/features/trip-planning/api/trip-model";

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
    <section className="mx-auto w-full max-w-6xl px-6 py-10 sm:py-14" aria-labelledby="trips-heading">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-widest text-primary">Không gian lập kế hoạch</p>
          <h1 id="trips-heading" className="text-h1 text-gray-900">Chuyến đi của bạn</h1>
          <p className="mt-3 max-w-2xl text-gray-600">Tạo, theo dõi và tiếp tục chỉnh sửa mọi lịch trình road trip của bạn.</p>
        </div>
        <Link href="/trips/new" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-md shadow-primary/20 transition-colors hover:bg-primary-hover">
          <Plus size={18} aria-hidden="true" /> Tạo chuyến đi
        </Link>
      </div>

      {state.kind === "loading" && <TripListLoading />}
      {state.kind === "error" && <TripListError message={state.message} onRetry={load} />}
      {state.kind === "content" && state.trips.length === 0 && <TripListEmpty />}
      {state.kind === "content" && state.trips.length > 0 && <TripList trips={state.trips} />}
    </section>
  );
}

function TripListLoading() {
  return <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Đang tải chuyến đi" aria-busy="true">{[0, 1, 2].map((index) => <div key={index} className="h-52 animate-pulse rounded-2xl border border-gray-100 bg-white" />)}</div>;
}

function TripListError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900"><div className="flex items-start gap-3"><CircleAlert className="mt-0.5 shrink-0" aria-hidden="true" /><div><h2 className="font-bold">Không tải được chuyến đi</h2><p className="mt-1 text-sm">{message}</p><button type="button" onClick={onRetry} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-bold hover:bg-red-100"><RefreshCw size={16} aria-hidden="true" /> Thử lại</button></div></div></div>;
}

function TripListEmpty() {
  return <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center"><Map className="mx-auto h-10 w-10 text-primary" aria-hidden="true" /><h2 className="mt-5 text-xl font-bold text-gray-900">Chưa có chuyến đi nào</h2><p className="mx-auto mt-2 max-w-md text-sm text-gray-600">Bắt đầu một lịch trình để lưu điểm dừng, ngày đi và kế hoạch của cả nhóm.</p><Link href="/trips/new" className="mt-6 inline-flex rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary-hover">Tạo chuyến đi đầu tiên</Link></div>;
}

function TripList({ trips }: { trips: readonly TripListItem[] }) {
  return <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Danh sách chuyến đi">{trips.map((trip) => <li key={trip.id}><Link href={`/trips/${trip.id}`} className="group block h-full rounded-2xl border border-gray-200 bg-white p-6 shadow-card transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card-hover"><div className="flex items-start justify-between gap-3"><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{statusLabels[trip.status]}</span><span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500"><Users size={14} aria-hidden="true" />{trip.role === "OWNER" ? "Chủ chuyến đi" : trip.permission === "EDIT" ? "Thành viên · Có thể chỉnh sửa" : "Thành viên · Chỉ xem"}</span></div><h2 className="mt-7 text-xl font-bold text-gray-900 group-hover:text-primary">{trip.title}</h2><p className="mt-4 flex items-center gap-2 text-sm text-gray-600"><CalendarDays size={16} aria-hidden="true" />{formatDateRange(trip.startDate, trip.endDate)}</p><span className="mt-7 inline-block text-sm font-bold text-primary">Mở lịch trình <span aria-hidden="true">→</span></span></Link></li>)}</ul>;
}
