"use client";

import { useEffect, useState } from "react";
import { GatewayApiError } from "@/features/trip-planning/api/gateway-request";
import { addStop, searchPlaces } from "@/features/trip-planning/api/trips";
import type { Place } from "@/features/trip-planning/api/trip-model";

export default function PlaceSearch({ tripId, dayId, onAdded }: { tripId: string; dayId: string; onAdded: () => void }) {
  const [query, setQuery] = useState(""); const [places, setPlaces] = useState<readonly Place[]>([]); const [message, setMessage] = useState<string>(); const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (query.trim().length < 2) { setPlaces([]); setMessage(undefined); return; }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setBusy(true); setMessage(undefined);
      try { setPlaces(await searchPlaces(query.trim(), controller.signal)); }
      catch (error) { if (!controller.signal.aborted) setMessage(error instanceof GatewayApiError ? error.message : "Không thể tìm địa điểm."); }
      finally { if (!controller.signal.aborted) setBusy(false); }
    }, 300);
    return () => { controller.abort(); window.clearTimeout(timer); };
  }, [query]);
  async function select(place: Place) {
    setBusy(true); setMessage(undefined);
    try { await addStop(tripId, dayId, place, crypto.randomUUID()); setQuery(""); setPlaces([]); onAdded(); }
    catch (error) { setMessage(error instanceof GatewayApiError ? error.message : "Không thể thêm điểm dừng."); }
    finally { setBusy(false); }
  }
  return <div className="mt-6 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4"><label className="block text-sm font-bold text-gray-800">Thêm điểm dừng<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm địa điểm…" className="field mt-2 bg-white" /></label>{busy && <p className="mt-2 text-sm text-gray-600">Đang tìm…</p>}{message && <p role="alert" className="mt-2 text-sm text-red-700">{message} <button onClick={() => setQuery(query)} className="font-bold underline">Thử lại</button></p>}{places.length > 0 && <ul className="mt-2 overflow-hidden rounded-lg border border-gray-200 bg-white">{places.map((place) => <li key={place.id}><button disabled={busy} onClick={() => void select(place)} className="w-full px-3 py-3 text-left hover:bg-gray-50 disabled:opacity-60"><strong className="block text-sm">{place.name}</strong><span className="text-xs text-gray-600">{place.address}</span></button></li>)}</ul>}</div>;
}
