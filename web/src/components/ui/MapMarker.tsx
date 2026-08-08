"use client";
import React, { useState } from "react";

export type MarkerType = "stop" | "gem" | "danger" | "partner";

export interface MapMarkerData {
  id: string;
  name: string;
  type: MarkerType;
  x: number;
  y: number;
  label?: string; // e.g. "1", "2"
  description?: string;
  isActive?: boolean;
}

interface MapMarkerProps {
  marker: MapMarkerData;
  onClick?: (id: string) => void;
  className?: string;
}

export default function MapMarker({ marker, onClick, className = "" }: MapMarkerProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const getMarkerIcon = () => {
    switch (marker.type) {
      case "stop":
        return (
          <div className="w-8 h-8 rounded-full bg-[#FF6B35] text-white flex items-center justify-center font-black text-xs border-2 border-white shadow-md shadow-[#FF6B35]/30">
            {marker.label || "•"}
          </div>
        );
      case "gem":
        return (
          <div className="w-8 h-8 rounded-full bg-[#FFD166] text-[#1A1A2E] flex items-center justify-center font-black text-sm border-2 border-white shadow-md shadow-[#FFD166]/30">
            ★
          </div>
        );
      case "danger":
        return (
          <div className="w-8 h-8 rounded-full bg-[#EF4444] text-white flex items-center justify-center font-bold text-sm border-2 border-white shadow-md shadow-[#EF4444]/30 animate-bounce">
            ⚠️
          </div>
        );
      case "partner":
        return (
          <div className="w-8 h-8 rounded-full bg-white text-[#FF6B35] flex items-center justify-center font-bold text-sm border-2 border-[#FF6B35] shadow-md shadow-[#FF6B35]/25">
            👑
          </div>
        );
    }
  };

  return (
    <div
      onClick={() => onClick?.(marker.id)}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className={`absolute cursor-pointer select-none smooth-transition hover:scale-110 -translate-x-1/2 -translate-y-1/2 ${className}`}
      style={{ left: `${marker.x}%`, top: `${marker.y}%`, zIndex: marker.isActive || showTooltip ? 50 : 20 }}
    >
      {/* Active Pulse Animation */}
      {marker.isActive && (
        <span className="absolute -inset-1.5 rounded-full bg-[#FF6B35]/30 animate-ping pointer-events-none" />
      )}

      {/* Actual Marker Bubble */}
      {getMarkerIcon()}

      {/* Tooltip Hover Overlay */}
      {showTooltip && (
        <div className="absolute top-[36px] left-1/2 -translate-x-1/2 w-44 bg-[#1A1A2E] text-white text-[11px] p-2.5 rounded-[12px] shadow-2xl z-[100] pointer-events-none animate-slide-in">
          <div className="font-extrabold pb-0.5 truncate text-[11.5px]">{marker.name}</div>
          {marker.description && (
            <div className="text-[#6B7280]+30 leading-snug mt-0.5">{marker.description}</div>
          )}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#1A1A2E] rotate-45" />
        </div>
      )}
    </div>
  );
}

