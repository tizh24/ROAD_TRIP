"use client";

import React, { useMemo } from "react";

interface Stop {
  id: string;
  name: string;
  distance: number;
}

interface SimulatedMapProps {
  stops: Stop[];
  activeTab?: string;
  groupMembers?: {
    id: string;
    name: string;
    status: string;
    speed: string;
    battery: string;
    x: number;
    y: number;
    color: string;
  }[];
  warnings?: {
    id: string;
    title: string;
    x: number;
    y: number;
    severity: "high" | "medium";
  }[];
}

export default function SimulatedMap({
  stops,
  activeTab = "planner",
  groupMembers = [],
  warnings = [],
}: SimulatedMapProps) {
  // Coordinates generator for the stops on our visual grid
  // Using pre-defined visual coordinates based on stop index or name for nice SVG plotting
  const stopCoordinates = useMemo(() => {
    return stops.map((stop, idx) => {
      // Create a nice loop path coordinates
      let x = 150;
      let y = 100;
      if (idx === 0) { x = 120; y = 300; } // Ha Giang milestone
      else if (idx === 1) { x = 140; y = 220; } // Quan Ba
      else if (idx === 2) { x = 280; y = 200; } // Tu San Huyen
      else if (idx === 3) { x = 260; y = 80; }  // Lung Cu Flagpole
      else if (idx === 4) { x = 320; y = 140; } // Ma Pi Leng
      else if (idx === 5) { x = 380; y = 240; } // Meo Vac
      else {
        // Fallback layout algorithms for custom added stops
        const angle = (idx / Math.max(stops.length, 1)) * Math.PI * 1.5;
        x = 220 + Math.cos(angle) * 120 + (idx * 15) % 40;
        y = 200 + Math.sin(angle) * 100 + (idx * 10) % 30;
      }
      return { ...stop, x, y };
    });
  }, [stops]);

  // Generate SVG path for the route connection
  const pathD = useMemo(() => {
    if (stopCoordinates.length === 0) return "";
    let d = `M ${stopCoordinates[0].x} ${stopCoordinates[0].y}`;
    for (let i = 1; i < stopCoordinates.length; i++) {
      // Using curves for a natural road look
      const prev = stopCoordinates[i - 1];
      const curr = stopCoordinates[i];
      const cpX = (prev.x + curr.x) / 2 + (curr.y - prev.y) * 0.1;
      const cpY = (prev.y + curr.y) / 2 + (prev.x - curr.x) * 0.1;
      d += ` Q ${cpX} ${cpY}, ${curr.x} ${curr.y}`;
    }
    // If it's a loop (often true for phượt), draw back to start loosely
    if (stopCoordinates.length > 2) {
      const last = stopCoordinates[stopCoordinates.length - 1];
      const first = stopCoordinates[0];
      d += ` Q ${(last.x + first.x) / 2} ${(last.y + first.y) / 2}, ${first.x} ${first.y}`;
    }
    return d;
  }, [stopCoordinates]);

  return (
    <div className="relative w-full h-[460px] bg-slate-50 border border-border-light rounded-2xl overflow-hidden shadow-inner flex flex-col">
      {/* Map Header Overlay */}
      <div className="absolute top-3 left-3 z-10 glass-panel px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 shadow-sm">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-semibold text-slate-700">VIETMAP API Đang Kết Nối</span>
        <span className="text-slate-400 border-l border-slate-300 pl-2">Hệ VN2000 Pro</span>
      </div>

      {/* Map Type Toggle Mock */}
      <div className="absolute top-3 right-3 z-10 flex border border-border-light bg-white rounded-lg p-0.5 shadow-sm text-xs">
        <button className="px-2.5 py-1 bg-brand-primary text-white rounded-md font-medium">Bản đồ</button>
        <button className="px-2.5 py-1 text-slate-500 hover:bg-slate-50 rounded-md">Vệ tinh</button>
        <button className="px-2.5 py-1 text-slate-500 hover:bg-slate-50 rounded-md">Địa hình</button>
      </div>

      {/* Main Map SVG Display Area */}
      <div className="flex-1 w-full relative bg-[#e2f1fd] overflow-hidden">
        {/* Simple Simulated Greenery & River Patches */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Forests/hills patches */}
          <path d="M-20,100 Q40,60 120,90 T240,60 T350,110 T500,80 L500,0 L-20,0 Z" fill="#d1ebd3" opacity="0.6" />
          <path d="M100,320 Q180,360 260,320 T420,380 T560,350 L560,500 L100,500 Z" fill="#c3ebc6" opacity="0.5" />
          {/* Blue river */}
          <path d="M-10,220 Q120,290 220,240 T380,290 T540,230 L540,245 T380,305 T220,255 T-10,235 Z" fill="#b9defc" />
          
          {/* Main Selected Route Line */}
          {pathD && (
            <>
              {/* Glowing shadow border */}
              <path
                d={pathD}
                fill="none"
                stroke="#60a5fa"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.3"
              />
              {/* Core road line */}
              <path
                d={pathD}
                fill="none"
                stroke="#0066ff"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="4,4"
              />
            </>
          )}

          {/* Dangerous/Warning Zones */}
          {activeTab === "tracker" && warnings.map((war) => (
            <g key={war.id}>
              <circle
                cx={war.x}
                cy={war.y}
                r="24"
                fill={war.severity === "high" ? "#ef4444" : "#f59e0b"}
                opacity="0.2"
                className="animate-pulse"
              />
              <circle
                cx={war.x}
                cy={war.y}
                r="8"
                fill={war.severity === "high" ? "#ef4444" : "#f59e0b"}
              />
              {/* Alert title overlay */}
              <rect x={war.x - 45} y={war.y - 28} width="90" height="15" rx="3" fill="#1e293b" opacity="0.85" />
              <text x={war.x} y={war.y - 17} textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold" fontFamily="sans-serif">
                {war.title}
              </text>
            </g>
          ))}

          {/* Stops Pins & Tooltips */}
          {stopCoordinates.map((stop, idx) => (
            <g key={stop.id} className="cursor-pointer group">
              {/* Pin indicator */}
              <circle cx={stop.x} cy={stop.y} r="10" fill="#ffffff" stroke="#003b95" strokeWidth="2.5" className="shadow-sm" />
              <circle cx={stop.x} cy={stop.y} r="5" fill="#0066ff" />
              
              {/* Stop Number Badge */}
              <rect x={stop.x - 8} y={stop.y - 25} width="16" height="13" rx="3" fill="#0066ff" />
              <text x={stop.x} y={stop.y - 15} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                {idx + 1}
              </text>

              {/* Stop Label Panel */}
              <g className="transition-all duration-300">
                <rect
                  x={stop.x - 50}
                  y={stop.y + 12}
                  width="100"
                  height="20"
                  rx="6"
                  fill="#ffffff"
                  stroke="#e2eeff"
                  strokeWidth="1.5"
                />
                <text
                  x={stop.x}
                  y={stop.y + 25}
                  textAnchor="middle"
                  fill="#1e293b"
                  fontSize="9.5"
                  fontWeight="600"
                  fontFamily="sans-serif"
                >
                  {stop.name.length > 14 ? stop.name.substring(0, 12) + ".." : stop.name}
                </text>
              </g>
            </g>
          ))}

          {/* Live Group Members Markers */}
          {activeTab === "tracker" && groupMembers.map((member) => (
            <g key={member.id} className="transition-all duration-1000">
              {/* Pulsing beacon circle */}
              {member.status !== "Mất mạng" && (
                <circle
                  cx={member.x}
                  cy={member.y}
                  r="16"
                  fill={member.color}
                  opacity="0.25"
                  className="animate-ping"
                />
              )}
              {/* Core position marker */}
              <path
                d={`M ${member.x} ${member.y - 12} L ${member.x + 8} ${member.y} L ${member.x - 8} ${member.y} Z`}
                fill={member.color}
              />
              <circle
                cx={member.x}
                cy={member.y}
                r="6"
                fill="#ffffff"
                stroke={member.color}
                strokeWidth="2"
              />

              {/* Member label */}
              <rect
                x={member.x - 35}
                y={member.y - 30}
                width="70"
                height="16"
                rx="4"
                fill="#002244"
                opacity="0.85"
              />
              <text
                x={member.x}
                y={member.y - 19}
                textAnchor="middle"
                fill="#ffffff"
                fontSize="8.5"
                fontWeight="500"
                fontFamily="sans-serif"
              >
                {member.name} • {member.speed}
              </text>
            </g>
          ))}
        </svg>

        {/* Legend Panel overlay (lower right) */}
        <div className="absolute bottom-3 left-3 bg-white/95 border border-border-light p-2.5 rounded-xl text-[10px] space-y-1 text-slate-600 shadow-sm max-w-[130px]">
          <p className="font-bold text-slate-800 border-b pb-0.5 mb-1">KÝ HIỆU BẢN ĐỒ</p>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1 border-t-2 border-dashed border-[#0066ff] inline-block"></span>
            <span>Tuyến đường chốt</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border border-[#003b95] bg-[#0066ff] inline-block"></span>
            <span>Điểm kiểm soát/Stops</span>
          </div>
          {activeTab === "tracker" && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block animate-pulse"></span>
                <span>Cảnh báo nguy hiểm</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-blue-500 rounded-sm inline-block"></span>
                <span>Thành viên đoàn</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Map Control Footer */}
      <div className="bg-white border-t border-border-light px-4 py-2 flex items-center justify-between text-xs text-slate-500">
        <div>Tọa độ trung tâm: 22.8256° N, 104.9822° E</div>
        <div className="flex items-center gap-3">
          <span>Khảo sát VietMap: QL 4C Hà Giang</span>
          <div className="flex border rounded overflow-hidden">
            <button className="px-2 py-0.5 bg-slate-50 hover:bg-slate-100 border-r">+</button>
            <button className="px-2 py-0.5 bg-slate-50 hover:bg-slate-100">-</button>
          </div>
        </div>
      </div>
    </div>
  );
}
