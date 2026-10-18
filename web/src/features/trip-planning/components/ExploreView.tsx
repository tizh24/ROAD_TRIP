"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Map, Search } from "lucide-react";
import { listPublicTrips, type PublicTrip } from "@/features/trip-planning/api/public-trips";
import { GatewayApiError } from "@/features/trip-planning/api/gateway-request";

export default function ExploreView() {
  const [trips, setTrips] = useState<readonly PublicTrip[]>([]); const [error, setError] = useState<string>();
  const load = useCallback(async () => { try { setError(undefined); setTrips(await listPublicTrips()); } catch (e) { setError(e instanceof GatewayApiError ? e.message : "Không tải được lộ trình."); } }, []);
  useEffect(() => { void load(); }, [load]);
  return <main className="min-h-[calc(100svh-72px)] bg-background"><header className="border-b border-border-main bg-surface px-4 py-7 sm:px-6"><div className="page-shell px-0"><p className="text-xs font-extrabold uppercase tracking-[.16em] text-primary">Khám phá</p><h1 className="mt-2 text-3xl font-extrabold tracking-[-.035em] sm:text-4xl">Chọn một hướng đi.</h1><label className="relative mt-5 block max-w-xl"><span className="sr-only">Tìm lộ trình</span><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-sub" /><input disabled className="field bg-background pl-11" placeholder="Bộ lọc đang được kết nối với dữ liệu thực" /></label></div></header><section className="page-shell px-4 py-8 sm:px-6"><div className="map-overlay mb-5 flex w-fit items-center gap-2 px-4 py-3 text-sm font-bold"><Map size={17} className="text-secondary" /> Lộ trình công khai</div>{error && <p role="alert" className="text-sm text-error">{error}</p>}{!error && trips.length === 0 && <p className="text-sm text-text-sub">Chưa có lộ trình công khai để khám phá.</p>}<div className="grid gap-4 md:grid-cols-2">{trips.map((trip) => <Link href={`/trip/${trip.id}`} key={trip.id} className="surface-card p-5 hover:bg-background-warm"><p className="text-xs font-bold text-primary">{trip.startDate} – {trip.endDate}</p><h2 className="mt-2 text-xl font-extrabold">{trip.title}</h2><p className="mt-2 text-sm text-text-sub">{trip.description ?? "Chưa có mô tả."}</p><p className="mt-4 text-sm font-bold">Ngân sách dự kiến: {trip.budgetAmount.toLocaleString("vi-VN")} {trip.currency}</p></Link>)}</div></section></main>;
}
