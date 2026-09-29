"use client";

import { useEffect, useState } from "react";
import { GatewayApiError } from "@/features/trip-planning/api/gateway-request";
import { addStop, searchPlaces } from "@/features/trip-planning/api/trips";
import type { Place } from "@/features/trip-planning/api/trip-model";
import { trackAnalytics } from "@/lib/analytics/analytics";

export default function PlaceSearch({ tripId, dayId, stopCount, onAdded }: { tripId: string; dayId: string; stopCount: number; onAdded: () => void }) {
  const [query, setQuery] = useState(""); const [places, setPlaces] = useState<readonly Place[]>([]); const [message, setMessage] = useState<string>(); const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (query.trim().length < 2) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setBusy(true); setMessage(undefined);
      try { setPlaces(await searchPlaces(query.trim(), controller.signal)); }
      catch (error) { if (!controller.signal.aborted) setMessage(error instanceof GatewayApiError ? error.message : "Không thể tìm địa điểm."); }
      finally { if (!controller.signal.aborted) setBusy(false); }
    }, 300);
    return () => { controller.abort(); window.clearTimeout(timer); };
  }, [query]);
  function updateQuery(value: string) { setQuery(value); if (value.trim().length < 2) { setPlaces([]); setMessage(undefined); } }
  async function select(place: Place) {
    setBusy(true); setMessage(undefined);
    const mutationKey = crypto.randomUUID();
    try { await addStop(tripId, dayId, place, mutationKey); if (stopCount === 0) trackAnalytics("first_stop_added", {}, { dedupeKey: `${tripId}:first-stop` }); setQuery(""); setPlaces([]); onAdded(); }
    catch (error) { setMessage(error instanceof GatewayApiError ? error.message : "Không thể thêm điểm dừng."); }
    finally { setBusy(false); }
  }
  return <div className="mt-6 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4"><label htmlFor="place-search" className="block text-sm font-bold text-gray-800">Thêm điểm dừng</label><input id="place-search" role="combobox" aria-expanded={places.length > 0} aria-controls="place-search-results" aria-autocomplete="list" value={query} onChange={(event) => updateQuery(event.target.value)} placeholder="Tìm địa điểm…" className="field mt-2 bg-white" />{busy && <p role="status" aria-live="polite" className="mt-2 text-sm text-gray-600">Đang tìm…</p>}{message && <p role="alert" className="mt-2 text-sm text-red-700">{message} <button type="button" onClick={() => updateQuery(query)} className="font-bold underline">Thử lại</button></p>}<ul id="place-search-results" role="listbox" className={`mt-2 overflow-hidden rounded-lg border border-gray-200 bg-white ${places.length === 0 ? "hidden" : ""}`}>{places.map((place) => <li key={place.id}><button role="option" aria-selected="false" type="button" disabled={busy} onClick={() => void select(place)} className="w-full px-3 py-3 text-left hover:bg-gray-50 disabled:opacity-60"><strong className="block text-sm">{place.name}</strong><span className="text-xs text-gray-600">{place.address}</span></button></li>)}</ul></div>;
}
