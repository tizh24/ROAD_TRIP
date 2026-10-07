import React, { useState } from "react";
import { Map, Maximize2, Minimize2, Navigation } from "lucide-react";
import MapMarker from "@/components/ui/MapMarker";
import type { StopRowProps } from "@/components/ui/StopRow";

export default function MapPanel({ stops }: { stops: StopRowProps["stop"][] }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  return <section className={`relative flex min-h-[42vh] flex-1 items-center justify-center overflow-hidden bg-[#DCE8D8] lg:min-h-0 ${isFullscreen ? "fixed inset-0 z-[80] min-h-screen" : ""}`} aria-label="Bản đồ lộ trình">
    <div className="absolute inset-0 opacity-55 [background-image:linear-gradient(rgba(16,42,67,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(16,42,67,.08)_1px,transparent_1px)] [background-size:2.5rem_2.5rem]" /><div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,.78),transparent_26%),radial-gradient(circle_at_82%_70%,rgba(0,105,72,.16),transparent_30%)]" />
    <div className="map-overlay absolute left-4 top-4 z-20 flex items-center gap-3 px-4 py-3 sm:left-6 sm:top-6"><span className="h-2.5 w-2.5 rounded-full bg-primary" /><Map size={16} className="text-secondary" /><div><h3 className="text-sm font-extrabold text-text-main">Bản đồ lộ trình</h3><p className="mt-0.5 text-[11px] text-text-sub">Hà Giang, Việt Nam</p></div></div>
    <div className="absolute right-4 top-4 z-20 flex gap-2 sm:right-6 sm:top-6"><button type="button" aria-label="Định vị lại bản đồ" className="focus-ring map-overlay p-3 hover:bg-background-warm"><Navigation size={19} className="text-secondary" /></button><button type="button" aria-label={isFullscreen ? "Thu nhỏ bản đồ" : "Mở toàn màn hình bản đồ"} aria-pressed={isFullscreen} onClick={() => setIsFullscreen((value) => !value)} className="focus-ring map-overlay p-3 hover:bg-background-warm">{isFullscreen ? <Minimize2 size={19} className="text-secondary" /> : <Maximize2 size={19} className="text-secondary" />}</button></div>
    {stops.map((stop, index) => <MapMarker key={stop.id} marker={{ id: stop.id, name: stop.name, type: "stop", x: 45 + index * 5, y: 70 - index * 15, label: String(index + 1) }} />)}
    <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full" aria-hidden="true"><path d="M 45% 70% Q 50% 60% 50% 55% T 55% 40%" fill="none" stroke="var(--color-primary)" strokeWidth="3" strokeDasharray="6 6" className="opacity-80" /></svg><p className="map-overlay absolute bottom-4 left-4 z-20 px-3 py-2 text-xs font-medium text-text-sub sm:bottom-6 sm:left-6">Kéo, phóng to hoặc chọn một điểm dừng để xem chi tiết.</p>
  </section>;
}
