import React, { useState } from "react";
import MapMarker from "@/components/ui/MapMarker";
import { Map, Maximize2, Minimize2, Navigation } from "lucide-react";
import type { StopRowProps } from "@/components/ui/StopRow";

export default function MapPanel({ stops }: { stops: StopRowProps["stop"][] }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  return (
    <div className={`relative flex flex-1 items-center justify-center overflow-hidden bg-[#d9e6d2] min-h-[40vh] lg:min-h-0 ${isFullscreen ? "fixed inset-0 z-[80] min-h-screen" : ""}`}>
      {/* Background Graphic */}
      <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,.72),transparent_26%),linear-gradient(135deg,transparent_38%,rgba(35,91,65,.1))]" />
      
      {/* Floating Tools on Map */}
      <div className="map-overlay absolute left-4 top-4 z-20 flex items-center gap-3 px-4 py-3 sm:left-6 sm:top-6">
        <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-sm" />
        <Map size={16} className="text-secondary" />
        <h3 className="font-bold text-text-main text-sm">Bản đồ lộ trình</h3>
        <span className="px-2.5 py-1 bg-primary/10 text-primary text-[10px] uppercase tracking-wider rounded-md font-bold">
          {stops.length} Điểm dừng
        </span>
      </div>

      <div className="absolute right-4 top-4 z-20 flex gap-2 sm:right-6 sm:top-6">
        <button type="button" aria-label="Định vị lại bản đồ" className="focus-ring map-overlay p-3 hover:bg-background-warm"><Navigation size={20} className="text-gray-600" /></button>
        <button type="button" aria-label={isFullscreen ? "Thu nhỏ bản đồ" : "Mở toàn màn hình bản đồ"} aria-pressed={isFullscreen} onClick={() => setIsFullscreen((value) => !value)} className="focus-ring map-overlay p-3 hover:bg-background-warm">{isFullscreen ? <Minimize2 size={20} className="text-gray-600" /> : <Maximize2 size={20} className="text-gray-600" />}</button>
      </div>

      {/* Mock Map Markers for stops */}
      {stops.map((stop, idx) => (
        <MapMarker 
          key={stop.id} 
          marker={{ 
            id: stop.id, 
            name: stop.name, 
            type: "stop", 
            x: 45 + idx * 5, 
            y: 70 - idx * 15, 
            label: (idx + 1).toString() 
          }} 
        />
      ))}
      
      {/* Fake SVG route line */}
      <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full" aria-hidden="true">
        <path 
          d="M 45% 70% Q 50% 60% 50% 55% T 55% 40%" 
          fill="none" 
          stroke="var(--color-primary)" 
          strokeWidth="3" 
          strokeDasharray="6,6" 
          className="opacity-70 drop-shadow-sm" 
        />
      </svg>
    </div>
  );
}
