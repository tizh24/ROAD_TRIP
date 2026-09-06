"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { GatewayApiError } from "@/features/trip-planning/api/gateway-request";
import { getTrip, moveStop, removeStop, reorderStops } from "@/features/trip-planning/api/trips";
import type { TripDetail } from "@/features/trip-planning/api/trip-model";
import PlaceSearch from "./PlaceSearch";


type State = { kind: "loading" } | { kind: "ready"; trip: TripDetail } | { kind: "missing" } | { kind: "forbidden" } | { kind: "error"; message: string };

export default function TripEditorView({ tripId }: { tripId: string }) {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [dayIndex, setDayIndex] = useState(0);
  const [mutationError, setMutationError] = useState<string>();
  const load = useCallback(async () => {
    setState({ kind: "loading" });
    try { setState({ kind: "ready", trip: await getTrip(tripId) }); }
    catch (error) {
      if (error instanceof GatewayApiError && error.code === "TRIP_NOT_FOUND") setState({ kind: "missing" });
      else if (error instanceof GatewayApiError && error.code === "FORBIDDEN") setState({ kind: "forbidden" });
      else setState({ kind: "error", message: error instanceof Error ? error.message : "Không thể tải lịch trình." });
    }
  }, [tripId]);
  useEffect(() => { queueMicrotask(() => { void load(); }); }, [load]);
  if (state.kind === "loading") return <main className="mx-auto w-full max-w-6xl animate-pulse px-6 py-12" aria-busy="true"><div className="h-10 w-72 rounded bg-gray-200" /><div className="mt-8 h-80 rounded-2xl bg-gray-100" /></main>;
  if (state.kind === "missing" || state.kind === "forbidden") return <Message title={state.kind === "missing" ? "Không tìm thấy chuyến đi" : "Bạn không có quyền truy cập"} detail={state.kind === "missing" ? "Chuyến đi có thể đã bị xóa hoặc không còn tồn tại." : "Bạn cần lời mời hợp lệ để xem lịch trình này."} />;
  if (state.kind === "error") return <Message title="Không thể tải lịch trình" detail={state.message} retry={load} />;
  const { trip } = state;
  const activeDay = trip.days[dayIndex]!;
  const canEdit = trip.role === "OWNER" || trip.permission === "EDIT";
  async function remove(stopId: string) {
    setMutationError(undefined);
    try { await removeStop(trip.id, stopId); await load(); }
    catch (error) { setMutationError(error instanceof Error ? error.message : "Không thể xóa điểm dừng."); }
  }
  async function reorder(stopId: string, direction: -1 | 1) {
    const stops = [...activeDay.stops]; const from = stops.findIndex((stop) => stop.id === stopId); const to = from + direction;
    if (from < 0 || to < 0 || to >= stops.length) return;
    [stops[from], stops[to]] = [stops[to]!, stops[from]!];
    setMutationError(undefined);
    try { await reorderStops(trip.id, activeDay.id, stops.map((stop) => stop.id)); await load(); }
    catch (error) { setMutationError(error instanceof Error ? error.message : "Không thể đổi thứ tự điểm dừng."); }
  }
  async function move(stopId: string, targetDayId: string) {
    setMutationError(undefined);
    try { await moveStop(trip.id, stopId, targetDayId, 1); await load(); }
    catch (error) { setMutationError(error instanceof Error ? error.message : "Không thể chuyển ngày cho điểm dừng."); }
  }
  return <main className="mx-auto w-full max-w-6xl px-6 py-10"><Link href="/trips" className="text-sm font-bold text-primary hover:underline">← Chuyến đi của bạn</Link><div className="mt-5 flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-bold text-primary">{trip.role === "OWNER" ? "Chủ chuyến đi" : canEdit ? "Thành viên có thể chỉnh sửa" : "Thành viên chỉ xem"}</p><h1 className="mt-1 text-h1 text-gray-900">{trip.title}</h1><p className="mt-2 text-gray-600">{trip.description || "Chưa có mô tả cho chuyến đi này."}</p></div>{canEdit && <span className="rounded-full bg-secondary/10 px-3 py-2 text-sm font-bold text-secondary">Bạn có thể chỉnh sửa lịch trình</span>}</div><div className="mt-10 grid gap-6 lg:grid-cols-[16rem_1fr]"><nav aria-label="Các ngày trong chuyến đi" className="rounded-2xl border border-gray-200 bg-white p-3">{trip.days.map((day, index) => <button key={day.id} onClick={() => setDayIndex(index)} className={`mb-1 w-full rounded-xl px-4 py-3 text-left text-sm font-bold ${index === dayIndex ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"}`}>Ngày {day.dayIndex}<span className="ml-2 font-medium opacity-80">{day.date}</span></button>)}</nav><section className="rounded-2xl border border-gray-200 bg-white p-6"><h2 className="text-xl font-bold text-gray-900">Ngày {activeDay.dayIndex} · {activeDay.date}</h2>{mutationError && <p role="alert" className="mt-3 text-sm text-red-700">{mutationError}</p>}{activeDay.stops.length === 0 ? <p className="mt-6 rounded-xl bg-gray-50 p-5 text-sm text-gray-600">Chưa có điểm dừng nào trong ngày này.{canEdit ? " Tìm một địa điểm để bắt đầu lập lịch trình." : ""}</p> : <ol className="mt-6 space-y-3">{activeDay.stops.map((stop, index) => <li key={stop.id} className="rounded-xl border border-gray-100 p-4"><span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{stop.stopIndex}</span><strong>{stop.name}</strong><p className="ml-10 mt-1 text-sm text-gray-600">{stop.address}</p>{stop.notes && <p className="ml-10 mt-2 text-sm text-gray-700">{stop.notes}</p>}{canEdit && <div className="ml-10 mt-3 flex flex-wrap gap-2"><button type="button" disabled={index === 0} onClick={() => void reorder(stop.id, -1)} className="rounded border px-2 py-1 text-xs font-bold disabled:opacity-40">Lên</button><button type="button" disabled={index === activeDay.stops.length - 1} onClick={() => void reorder(stop.id, 1)} className="rounded border px-2 py-1 text-xs font-bold disabled:opacity-40">Xuống</button>{trip.days.filter((day) => day.id !== activeDay.id).map((day) => <button type="button" key={day.id} onClick={() => void move(stop.id, day.id)} className="rounded border px-2 py-1 text-xs font-bold">Chuyển ngày {day.dayIndex}</button>)}<button type="button" onClick={() => void remove(stop.id)} className="rounded border border-red-200 px-2 py-1 text-xs font-bold text-red-700 hover:bg-red-50">Xóa</button></div>}</li>)}</ol>}{canEdit && <PlaceSearch tripId={trip.id} dayId={activeDay.id} onAdded={() => void load()} />}</section></div></main>;
}
function Message({ title, detail, retry }: { title: string; detail: string; retry?: () => void }) { return <main className="mx-auto max-w-xl px-6 py-20 text-center"><h1 className="text-h2 text-gray-900">{title}</h1><p className="mt-3 text-gray-600">{detail}</p><div className="mt-7 flex justify-center gap-3"><Link href="/trips" className="rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white">Về danh sách chuyến đi</Link>{retry && <button onClick={retry} className="rounded-xl border border-gray-300 px-4 py-3 text-sm font-bold">Thử lại</button>}</div></main>; }
