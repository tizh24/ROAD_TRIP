"use client";
import React from "react";
import CTAButton from "@/components/ui/CTAButton";
import TripCard from "@/components/ui/TripCard";
import Link from "next/link";
import { Edit3, Crown, Bookmark, Map, Plus, LogOut, Settings } from "lucide-react";

const MY_COLLECTIONS = [
  { id: "1", title: "Cung đường chữ S - Khám phá Tây Bắc", image: "https://images.unsplash.com/photo-1596700543598-68e37cb0cc2c?auto=format&fit=crop&w=600&q=80", province: "Lai Châu", clones: 1250, author: { name: "Nguyễn Nam", avatar: "https://i.pravatar.cc/150?u=1" }, duration: "4 Ngày", distance: "450 km", cost: "1.2M đ" },
];

export default function UserProfileView() {
  return (
    <div className="w-full min-h-[calc(100vh-72px)] bg-[#F8FAFC] pb-24 pt-10 font-sans text-gray-900">
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12">
        
        {/* Left: Profile & Subscription */}
        <div className="md:col-span-4 space-y-8">
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 text-center shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-gray-900 to-gray-800" />
            <div className="relative z-10 pt-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop" alt="User" className="w-24 h-24 rounded-[24px] border-4 border-white mx-auto mb-5 object-cover shadow-lg group-hover:scale-105 transition-transform" />
              <h2 className="text-xl font-black text-gray-900 mb-1 tracking-tight">Tuấn Phượt Thủ</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-8">@tuan_explore</p>
              
              <div className="flex justify-center gap-8 mb-8 text-left bg-gray-50 p-4 rounded-2xl">
                <div>
                  <p className="text-2xl font-black text-gray-900 tracking-tight">12</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Lộ trình</p>
                </div>
                <div className="w-px bg-gray-200" />
                <div>
                  <p className="text-2xl font-black text-gray-900 tracking-tight">3.4k</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Lượt Clone</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Link href="/profile/settings">
                  <CTAButton variant="secondary" className="w-full text-sm font-bold py-3.5 flex items-center justify-center gap-2 border-2 border-gray-100 hover:bg-gray-900 hover:text-white transition-all rounded-xl">
                    <Edit3 size={16} /> Chỉnh sửa hồ sơ
                  </CTAButton>
                </Link>
                <div className="flex gap-3">
                  <Link href="/profile/settings" className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold py-3 rounded-xl flex justify-center items-center gap-2 text-xs transition-colors">
                    <Settings size={14} /> Cài đặt
                  </Link>
                  <Link href="/login" className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 rounded-xl flex justify-center items-center gap-2 text-xs transition-colors">
                    <LogOut size={14} /> Thoát
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Banner */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-100 p-8 rounded-[32px] border border-orange-200/50 shadow-sm relative overflow-hidden group cursor-pointer hover:shadow-md transition-shadow">
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4 group-hover:scale-110 transition-transform duration-500 text-orange-500">
              <Crown size={120} />
            </div>
            <h3 className="text-sm font-black text-orange-900 uppercase tracking-widest mb-3 relative z-10 flex items-center gap-2">
              <Crown size={16} /> Explorer Pass
            </h3>
            <p className="text-sm text-orange-800 leading-relaxed mb-6 relative z-10 font-medium">Bạn đang sử dụng gói Miễn phí. Nâng cấp 49k/tháng để mở khóa Cảnh báo tốc độ độc quyền & Icon VIP.</p>
            <Link href="/profile/billing">
              <button className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-6 py-3.5 rounded-xl transition-colors shadow-lg shadow-orange-500/20 relative z-10">
                Nâng cấp ngay
              </button>
            </Link>
          </div>
        </div>

        {/* Right: Collections & Drafts */}
        <div className="md:col-span-8 space-y-12">
          <section>
            <div className="flex justify-between items-end mb-8">
              <div className="flex items-center gap-3">
                <Map size={24} className="text-gray-900" />
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Lộ trình của tôi</h2>
              </div>
              <Link href="/planner">
                <span className="text-sm font-bold text-primary cursor-pointer hover:text-primary/80 transition-colors flex items-center gap-1">
                  <Plus size={16} /> Tạo mới
                </span>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {MY_COLLECTIONS.map(trip => (
                <div key={trip.id} className="hover:-translate-y-1 transition-transform">
                  <TripCard trip={trip} />
                </div>
              ))}
              
              {/* Draft Box */}
              <Link href="/planner" className="border-2 border-dashed border-gray-200 rounded-[24px] flex flex-col items-center justify-center p-8 text-center bg-white/50 hover:bg-white cursor-pointer transition-all min-h-[300px] group hover:border-primary/50 block">
                <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors mb-4 mx-auto">
                  <Plus size={24} />
                </div>
                <h4 className="font-bold text-gray-900 text-base mb-1 tracking-tight">Tạo chuyến đi mới</h4>
                <p className="text-sm text-gray-500 font-medium">Mở bản đồ và kéo thả điểm dừng</p>
              </Link>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-8">
              <Bookmark size={24} className="text-gray-900" />
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Đã lưu (Saved)</h2>
            </div>
            <div className="p-12 bg-white rounded-[32px] border border-gray-100 text-center shadow-sm flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <Bookmark size={32} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-500 font-medium max-w-xs">Bạn chưa lưu lộ trình nào từ cộng đồng. Hãy khám phá và lưu những lộ trình thú vị nhé.</p>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
