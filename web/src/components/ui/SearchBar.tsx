"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { GatewayApiError } from "@/features/trip-planning/api/gateway-request";
import { searchPlaces } from "@/features/trip-planning/api/trips";
import type { Place } from "@/features/trip-planning/api/trip-model";

type Props = { placeholder?: string; className?: string };

export default function SearchBar({ placeholder = "Tìm địa danh, cung đường phượt...", className = "" }: Props) {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [places, setPlaces] = useState<readonly Place[]>([]);
  const [message, setMessage] = useState<string>();
  const [busy, setBusy] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const listboxId = "navbar-place-results";

  useEffect(() => {
    const close = (event: MouseEvent) => { if (root.current && !root.current.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    const query = value.trim();
    if (query.length < 2) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setBusy(true); setMessage(undefined);
      try { setPlaces(await searchPlaces(query, controller.signal)); }
      catch (error) { if (!controller.signal.aborted) { setPlaces([]); setMessage(error instanceof GatewayApiError ? error.message : "Không thể tìm địa điểm lúc này."); } }
      finally { if (!controller.signal.aborted) setBusy(false); }
    }, 300);
    return () => { controller.abort(); window.clearTimeout(timer); };
  }, [value]);

  const update = (next: string) => {
    setValue(next);
    if (next.trim().length < 2) { setPlaces([]); setMessage(undefined); setBusy(false); }
  };

  const showResults = open && value.trim().length >= 2;
  return <div ref={root} className={`relative flex-1 max-w-md ${className}`}>
    <div className={`relative flex h-11 items-center rounded-lg border bg-white px-3.5 transition-colors ${open ? "border-primary ring-2 ring-primary/15" : "border-border"}`}>
      <Search aria-hidden="true" size={18} className="text-muted-foreground" />
      <input type="search" role="combobox" value={value} onChange={(event) => update(event.target.value)} onFocus={() => setOpen(true)} placeholder={placeholder} aria-label={placeholder} aria-autocomplete="list" aria-controls={listboxId} aria-expanded={showResults} className="h-full w-full border-none bg-transparent pl-3 text-sm text-foreground outline-none placeholder:text-muted-foreground" />
      {value ? <button type="button" aria-label="Xóa tìm kiếm" onClick={() => update("")} className="text-muted-foreground hover:text-foreground"><X size={16} /></button> : null}
    </div>
    {showResults ? <div className="absolute left-0 top-[48px] z-[100] w-full overflow-hidden rounded-xl border border-border bg-white p-1.5 shadow-lg">
      {busy ? <p role="status" className="px-3.5 py-4 text-xs text-muted-foreground">Đang tìm địa điểm…</p> : message ? <p role="alert" className="px-3.5 py-4 text-xs text-destructive">{message}</p> : places.length ? <ul id={listboxId} role="listbox" className="space-y-0.5">{places.map((place) => <li key={place.id}><button type="button" role="option" aria-selected={false} onClick={() => { update(place.name); setOpen(false); }} className="w-full rounded-lg px-3.5 py-2.5 text-left hover:bg-muted"><span className="block text-xs font-bold text-foreground">{place.name}</span><span className="mt-0.5 block text-[10px] text-muted-foreground">{place.address}</span></button></li>)}</ul> : <p className="px-3.5 py-4 text-xs text-muted-foreground">Không tìm thấy địa điểm phù hợp.</p>}
    </div> : null}
  </div>;
}
