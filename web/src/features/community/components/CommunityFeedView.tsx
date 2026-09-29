"use client";
import React from "react";
import CTAButton from "@/components/ui/CTAButton";
import TripCard from "@/components/ui/TripCard";
import { Trophy, TrendingUp, Clock, MapPin, Edit3, Flame } from "lucide-react";

const FEED_TRIPS = [
  { id: "1", title: "Khám phá Vịnh Hạ Long", image: "https://images.unsplash.com/photo-1627917865664-df818cb49b8f?auto=format&fit=crop&w=600&q=80", province: "Quảng Ninh", clones: 950, author: { name: "Trần Anh", avatar: "https://i.pravatar.cc/150?u=3" }, duration: "2 Ngày", distance: "180 km", cost: "800k đ" },
  { id: "2", title: "Cung đường chữ S - Tây Bắc", image: "https://images.unsplash.com/photo-1596700543598-68e37cb0cc2c?auto=format&fit=crop&w=600&q=80", province: "Lai Châu", clones: 1250, author: { name: "Nguyễn Nam", avatar: "https://i.pravatar.cc/150?u=1" }, duration: "4 Ngày", distance: "450 km", cost: "1.2M đ" },
];

export default function CommunityFeedView() {
  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] pt-10 pb-24 font-sans text-gray-900">
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* MAIN FEED */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Banner Challenge */}
          <div className="w-full bg-gray-900 rounded-[32px] p-8 md:p-10 text-white shadow-xl relative overflow-hidden group cursor-pointer">
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4 transition-transform duration-700 group-hover:scale-110">
              <Trophy size={200} />
            </div>
            <div className="relative z-10">
              <span className="px-4 py-1.5 bg-gradient-to-r from-orange-500 to-primary text-white text-[10px] font-black rounded-md uppercase tracking-widest shadow-sm mb-6 inline-flex items-center gap-2">
                <Flame size={12} /> Thử thách tháng 10
              </span>
              <h2 className="text-3xl md:text-4xl font-black mb-3 tracking-tight">Chinh Phục 4 Cực Việt Nam</h2>
              <p className="text-sm md:text-base text-gray-400 max-w-md leading-relaxed mb-8 font-medium">
                Đăng tải lộ trình check-in 1 trong 4 điểm cực của tổ quốc để nhận ngay Badge Độc quyền và Voucher 500.000đ từ Klook.
              </p>
              <CTAButton variant="primary" className="shadow-lg shadow-primary/20 px-8 py-3.5 rounded-xl font-bold text-sm">
                Tham gia ngay
              </CTAButton>
            </div>
          </div>

          {/* Feed Categories */}
          <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
            <span className="px-6 py-2.5 bg-gray-900 text-white text-xs font-bold rounded-full whitespace-nowrap cursor-pointer shadow-md">Đề xuất cho bạn</span>
            <span className="px-6 py-2.5 bg-white text-gray-600 border border-gray-200 hover:border-gray-900 hover:text-gray-900 text-xs font-bold rounded-full whitespace-nowrap cursor-pointer transition-colors flex items-center gap-2">
              <TrendingUp size={14} /> Đang Trending
            </span>
            <span className="px-6 py-2.5 bg-white text-gray-600 border border-gray-200 hover:border-gray-900 hover:text-gray-900 text-xs font-bold rounded-full whitespace-nowrap cursor-pointer transition-colors flex items-center gap-2">
              <Clock size={14} /> Mới nhất
            </span>
            <span className="px-6 py-2.5 bg-white text-gray-600 border border-gray-200 hover:border-gray-900 hover:text-gray-900 text-xs font-bold rounded-full whitespace-nowrap cursor-pointer transition-colors flex items-center gap-2">
              <MapPin size={14} /> Gần bạn
            </span>
          </div>

          {/* Posts/Trips Stream */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {FEED_TRIPS.map(trip => (
                <div key={trip.id} className="transition-transform duration-300 hover:-translate-y-1">
                  <TripCard trip={trip} />
                </div>
              ))}
            </div>
            
            {/* Infinite Scroll Loader Mock */}
            <div className="py-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR: Stats & Trending locations */}
        <div className="lg:col-span-4 space-y-8">
          
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Flame size={14} className="text-orange-500" /> Top Tỉnh Thành Tuần Này
            </h3>
            <div className="space-y-5">
              {[
                { name: "Hà Giang", count: 1245 },
                { name: "Lâm Đồng", count: 850 },
                { name: "Cao Bằng", count: 620 },
              ].map((loc, i) => (
                <div key={loc.name} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-black text-gray-200 group-hover:text-primary transition-colors">0{i+1}</span>
                    <span className="font-bold text-gray-900 text-sm">{loc.name}</span>
                  </div>
                  <span className="text-[10px] bg-gray-50 text-gray-500 px-2.5 py-1 rounded-md font-bold border border-gray-100">{loc.count} lộ trình</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Edit3 size={14} className="text-blue-500" /> Góp ý cho cộng đồng
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-6 font-medium">
              Hệ thống đang thu thập đánh giá về tình trạng sạt lở đèo Bảo Lộc. Bạn vừa đi ngang qua?
            </p>
            <CTAButton variant="ghost" className="w-full text-sm font-bold py-3.5 border-2 border-gray-100 hover:border-gray-900 hover:bg-gray-900 hover:text-white rounded-xl transition-all">
              Viết cập nhật đường sá
            </CTAButton>
          </div>
        </div>
        
      </div>
    </div>
  );
}
