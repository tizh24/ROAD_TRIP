import React from "react";
import MapMarker from "@/components/ui/MapMarker";
import { Navigation } from "lucide-react";

export default function MapPanel({ stops }: { stops: any[] }) {
  return (
    <div className="flex-1 relative bg-gray-100 overflow-hidden flex items-center justify-center">
      {/* Background Graphic */}
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')]" />
      
      {/* Floating Tools on Map */}
      <div className="absolute top-6 left-6 z-10 bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-sm" />
        <h3 className="font-bold text-gray-800 text-sm">Bản đồ Lộ Trình</h3>
        <span className="px-2.5 py-1 bg-primary/10 text-primary text-[10px] uppercase tracking-wider rounded-md font-bold">
          {stops.length} Điểm dừng
        </span>
      </div>

      <div className="absolute top-6 right-6 z-10 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors">
        <Navigation size={20} className="text-gray-600" />
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
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
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
