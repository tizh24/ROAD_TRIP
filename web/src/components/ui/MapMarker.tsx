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
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary text-xs font-black text-white shadow-card">
            {marker.label || "•"}
          </div>
        );
      case "gem":
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-amber-200 text-sm font-black text-secondary shadow-card">
            ★
          </div>
        );
      case "danger":
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-danger text-sm font-bold text-white shadow-card animate-bounce">
            ⚠️
          </div>
        );
      case "partner":
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-white text-sm font-bold text-primary shadow-card">
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
        <span className="pointer-events-none absolute -inset-1.5 animate-ping rounded-full bg-primary/30" />
      )}

      {/* Actual Marker Bubble */}
      {getMarkerIcon()}

      {/* Tooltip Hover Overlay */}
      {showTooltip && (
        <div className="pointer-events-none absolute left-1/2 top-[36px] z-[100] w-44 -translate-x-1/2 animate-slide-in rounded-lg bg-secondary p-2.5 text-[11px] text-white shadow-float">
          <div className="font-extrabold pb-0.5 truncate text-[11.5px]">{marker.name}</div>
          {marker.description && (
            <div className="mt-0.5 leading-snug text-white/70">{marker.description}</div>
          )}
          <div className="absolute -top-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 bg-secondary" />
        </div>
      )}
    </div>
  );
}

