"use client";
import React, { useState } from "react";
import TripCard, { TripData } from "@/components/ui/TripCard";
import MapMarker from "@/components/ui/MapMarker";
import { Search, Map as MapIcon, List, SlidersHorizontal, MapPin } from "lucide-react";

const EXPLORE_TRIPS: TripData[] = [
  { id: "1", title: "Cung đường chữ S - Khám phá Tây Bắc", image: "https://images.unsplash.com/photo-1596700543598-68e37cb0cc2c?auto=format&fit=crop&w=600&q=80", province: "Lai Châu", clones: 1250, author: { name: "Nguyễn Nam", avatar: "https://i.pravatar.cc/150?u=1" }, duration: "4 Ngày", distance: "450 km", cost: "1.2M đ" },
  { id: "2", title: "Vòng lặp Hà Giang Mùa Vàng", image: "https://images.unsplash.com/photo-1626021200230-01d0c1598f1f?auto=format&fit=crop&w=600&q=80", province: "Hà Giang", clones: 3400, author: { name: "Phượt Thủ 99", avatar: "https://i.pravatar.cc/150?u=2" }, duration: "5 Ngày", distance: "350 km", cost: "1.5M đ" },
  { id: "3", title: "Khám phá Thác Bản Giốc", image: "https://images.unsplash.com/photo-1627917865664-df818cb49b8f?auto=format&fit=crop&w=600&q=80", province: "Cao Bằng", clones: 950, author: { name: "Trần Anh", avatar: "https://i.pravatar.cc/150?u=3" }, duration: "2 Ngày", distance: "180 km", cost: "800k đ" },
  { id: "4", title: "Săn mây Tà Xùa", image: "https://images.unsplash.com/photo-1541628951107-a55850900b9d?auto=format&fit=crop&w=600&q=80", province: "Sơn La", clones: 2100, author: { name: "Phượt Thủ 99", avatar: "https://i.pravatar.cc/150?u=2" }, duration: "2 Ngày", distance: "200 km", cost: "900k đ" },
];

export default function ExploreView() {
  const [budget, setBudget] = useState(2000000);
  const [hoveredTripId, setHoveredTripId] = useState<string | null>(null);
  const [showMobileMap, setShowMobileMap] = useState(false);
  
  return (
    <div className="flex flex-col lg:flex-row w-full h-[calc(100vh-72px)] bg-white overflow-hidden relative font-sans">
      
      {/* LEFT SIDEBAR: Filters & List */}
      <div className={`w-full lg:w-[500px] xl:w-[550px] flex flex-col border-r border-gray-100 bg-white shrink-0 h-full relative z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-transform duration-300 ${showMobileMap ? '-translate-x-full lg:translate-x-0 absolute lg:relative' : 'translate-x-0'}`}>
        
        {/* Sticky Filters Header */}
        <div className="p-4 md:p-6 border-b border-gray-100 bg-white/95 backdrop-blur-md z-10 space-y-4 shrink-0">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Khám phá lộ trình</h1>
          
          <div className="relative w-full">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm điểm đến, tỉnh thành..." 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-primary/40 focus:ring-4 focus:ring-primary/10 transition-all text-sm"
            />
          </div>
          
          <div className="pt-2">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
              <span className="px-4 py-1.5 rounded-full bg-gray-900 text-white text-xs font-semibold cursor-pointer shrink-0 shadow-md shadow-gray-900/20">Miền Bắc</span>
              <span className="px-4 py-1.5 rounded-full bg-white text-gray-600 text-xs font-semibold border border-gray-200 hover:border-gray-900 hover:text-gray-900 cursor-pointer transition-colors shrink-0">Miền Trung</span>
              <span className="px-4 py-1.5 rounded-full bg-white text-gray-600 text-xs font-semibold border border-gray-200 hover:border-gray-900 hover:text-gray-900 cursor-pointer transition-colors shrink-0">Tây Nguyên</span>
              <button className="px-3 py-1.5 rounded-full bg-gray-50 text-gray-600 text-xs font-semibold border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors shrink-0 flex items-center gap-1.5 ml-auto">
                <SlidersHorizontal size={12} /> Bộ lọc
              </button>
            </div>
          </div>
        </div>
        
        {/* Scrollable Trips List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#FAFAFA] custom-scrollbar">
          <p className="text-[11px] text-gray-500 font-bold mb-4 uppercase tracking-wider flex items-center gap-2">
            Tìm thấy {EXPLORE_TRIPS.length} lộ trình phù hợp
          </p>
          <div className="flex flex-col gap-5 pb-24 lg:pb-6">
            {EXPLORE_TRIPS.map(trip => (
              <div 
                key={trip.id}
                onMouseEnter={() => setHoveredTripId(trip.id)}
                onMouseLeave={() => setHoveredTripId(null)}
                className="transition-transform duration-300 hover:-translate-y-1"
              >
                <TripCard trip={trip} />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* RIGHT SIDE: Interactive Map */}
      <div className={`flex-1 relative bg-gray-100 overflow-hidden items-center justify-center transition-transform duration-300 ${!showMobileMap ? 'translate-x-full lg:translate-x-0 absolute lg:relative w-full h-full' : 'translate-x-0 w-full h-full'}`}>
        
        {/* Abstract Map Background (Google Maps / Mapbox simulation) */}
        <div className="absolute inset-0 bg-[#E8F0F2]">
          <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')]" />
        </div>
        
        {/* Mock Map Overlay UI */}
        <div className="absolute top-6 left-6 z-10 flex gap-2">
          <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl shadow-sm flex items-center gap-2 border border-gray-100">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(255,107,53,0.8)]" />
            <span className="text-xs font-bold text-gray-800">Bản đồ tương tác</span>
          </div>
        </div>
        
        {/* Map Markers with Hover Synchronization */}
        {EXPLORE_TRIPS.map((trip, idx) => {
          const isHovered = hoveredTripId === trip.id;
          return (
            <div 
              key={trip.id}
              className={`absolute transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 z-10
                ${isHovered ? 'scale-125 z-20' : 'scale-100 hover:scale-110'}
              `}
              style={{ left: `${45 + idx * 8}%`, top: `${35 + idx * 10}%`, cursor: 'pointer' }}
            >
              <div className={`flex flex-col items-center group`}>
                {isHovered && (
                  <div className="bg-gray-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-md mb-1 shadow-lg whitespace-nowrap animate-fade-in-up">
                    {trip.title}
                  </div>
                )}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-colors border-2 ${isHovered ? 'bg-primary border-white text-white' : 'bg-white border-primary text-primary'}`}>
                  <MapPin size={16} className={isHovered ? 'fill-primary' : 'fill-none'} />
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Fake Route connecting the pins (Stylistic only) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
          <path d="M 45% 35% L 53% 45% L 61% 55% L 69% 65%" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="3" strokeDasharray="4,4" className="drop-shadow-sm" />
        </svg>
      </div>

      {/* Floating Map Toggle Button for Mobile */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <button 
          onClick={() => setShowMobileMap(!showMobileMap)}
          className="bg-gray-900 text-white px-6 py-3.5 rounded-full font-bold shadow-xl shadow-gray-900/30 flex items-center gap-2 active:scale-95 transition-all hover:bg-gray-800"
        >
          {showMobileMap ? <List size={18} /> : <MapIcon size={18} />}
          <span>{showMobileMap ? 'Xem Danh Sách' : 'Xem Bản Đồ'}</span>
        </button>
      </div>
    </div>
  );
}
