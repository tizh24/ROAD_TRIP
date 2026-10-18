"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { clonePublicTrip } from "@/features/trip-planning/api/public-trips";
import { GatewayApiError } from "@/features/trip-planning/api/gateway-request";

type PublicTripDetail = { id: string; title: string; description: string | null; startDate: string; endDate: string; budgetAmount: number; currency: string; days: readonly { id: string; date: string; dayIndex: number; stops: readonly { id: string; name: string; address: string }[] }[] };

export default function TripDetailView({ isAuthenticated, trip }: { isAuthenticated: boolean; trip: PublicTripDetail }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false); const [error, setError] = useState<string>();
  const clone = async () => {
    if (!isAuthenticated) { router.push(`/login?next=${encodeURIComponent(`/trip/${trip.id}`)}`); return; }
    try { setBusy(true); setError(undefined); const copy = await clonePublicTrip(trip.id, crypto.randomUUID()); router.push(`/planner/${copy.id}`); }
    catch (cause) { setError(cause instanceof GatewayApiError ? cause.message : "Không thể tạo bản sao lúc này."); setBusy(false); }
  };
  return <main className="bg-background pb-20 text-text-main"><section className="bg-secondary px-4 pb-12 pt-28 text-white sm:px-6"><div className="page-shell px-0"><Link href="/explore" className="focus-ring text-sm font-bold text-white/80 hover:text-white">← Khám phá</Link><h1 className="mt-8 max-w-4xl text-4xl font-extrabold sm:text-6xl">{trip.title}</h1><p className="mt-4 max-w-2xl text-white/75">{trip.description ?? "Chưa có mô tả cho lộ trình này."}</p><p className="mt-6 inline-flex items-center gap-2 text-sm text-white/80"><CalendarDays size={16} />{trip.startDate} – {trip.endDate}</p></div></section><div className="page-shell grid gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_20rem]"><article><h2 className="text-2xl font-extrabold">Lịch trình</h2>{trip.days.length === 0 && <p className="mt-4 text-text-sub">Lộ trình này chưa có điểm dừng công khai.</p>}{trip.days.map((day) => <section key={day.id} className="mt-7 border-l-2 border-primary pl-5"><p className="text-sm font-bold text-primary">Ngày {day.dayIndex} · {day.date}</p>{day.stops.map((stop) => <div key={stop.id} className="mt-4"><h3 className="font-bold">{stop.name}</h3><p className="text-sm text-text-sub">{stop.address}</p></div>)}</section>)}</article><aside className="surface-card h-fit p-6"><MapPin className="text-primary" /><h2 className="mt-4 text-xl font-extrabold">Tạo bản sao riêng</h2><p className="mt-2 text-sm text-text-sub">Bản sao được tạo dưới dạng hành trình riêng tư để bạn tùy chỉnh.</p>{error && <p role="alert" className="mt-3 text-sm text-error">{error}</p>}<button disabled={busy} onClick={() => void clone()} className="focus-ring mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{busy ? "Đang tạo bản sao…" : isAuthenticated ? "Clone lộ trình" : "Đăng nhập để clone"}<ArrowRight size={16} /></button><p className="mt-4 text-sm font-bold">Ngân sách dự kiến: {trip.budgetAmount.toLocaleString("vi-VN")} {trip.currency}</p></aside></div></main>;
}
