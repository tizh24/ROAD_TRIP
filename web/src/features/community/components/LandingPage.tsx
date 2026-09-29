"use client";
import React from "react";
import CTAButton from "@/components/ui/CTAButton";
import TripCard from "@/components/ui/TripCard";
import Link from "next/link";
import { Map, Compass, Camera, ArrowRight, Star } from "lucide-react";

const FEATURED_TRIPS = [
  { id: "1", title: "Cung đường chữ S - Khám phá Tây Bắc", image: "https://images.unsplash.com/photo-1596700543598-68e37cb0cc2c?auto=format&fit=crop&w=600&q=80", province: "Lai Châu", clones: 1250, author: { name: "Nguyễn Nam", avatar: "https://i.pravatar.cc/150?u=1" }, duration: "4 Ngày", distance: "450 km", cost: "1.2M đ" },
  { id: "2", title: "Vòng lặp Hà Giang Mùa Vàng", image: "https://images.unsplash.com/photo-1626021200230-01d0c1598f1f?auto=format&fit=crop&w=600&q=80", province: "Hà Giang", clones: 3400, author: { name: "Phượt Thủ 99", avatar: "https://i.pravatar.cc/150?u=2" }, duration: "5 Ngày", distance: "350 km", cost: "1.5M đ" },
  { id: "3", title: "Khám phá Thác Bản Giốc", image: "https://images.unsplash.com/photo-1627917865664-df818cb49b8f?auto=format&fit=crop&w=600&q=80", province: "Cao Bằng", clones: 950, author: { name: "Trần Anh", avatar: "https://i.pravatar.cc/150?u=3" }, duration: "2 Ngày", distance: "180 km", cost: "800k đ" },
];

export default function LandingPage() {
  return (
    <div className="w-full bg-[#FAFAFA] overflow-hidden font-sans">
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full min-h-[600px] flex items-center justify-center pt-24 pb-24 px-6 overflow-hidden">
        {/* Abstract shapes instead of heavy map pattern */}
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] z-0 pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] z-0 pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-4 shadow-sm animate-fade-in-up">
            <Star size={14} className="text-primary fill-primary" /> Giải pháp số 1 cho cộng đồng Backpacker
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight leading-tight">
            Lên Kế Hoạch. Đi Phượt. <br className="hidden md:block" />
            <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-orange-500">Lưu Kỷ Niệm.</span>
          </h1>
          
          <p className="text-base md:text-lg text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed mt-6">
            Nền tảng tiên phong giúp bạn kéo thả lộ trình dễ dàng, nhận cảnh báo thông minh trên đường và tự động chia tiền (Split Bill) sau chuyến đi.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link href="/planner">
              <CTAButton variant="primary" className="w-full sm:w-auto px-8 py-3.5 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all text-base font-semibold">
                Tạo lộ trình đầu tiên
              </CTAButton>
            </Link>
            <Link href="/feed">
              <CTAButton variant="ghost" className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all text-base font-semibold shadow-sm">
                Khám phá cộng đồng
              </CTAButton>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITION (3 STEPS) */}
      <section className="w-full bg-white py-24 px-6 border-y border-gray-100">
        <div className="max-w-[1400px] mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-16 tracking-tight">Vòng lặp trải nghiệm độc quyền</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 lg:gap-12">
            <div className="flex flex-col items-center text-center space-y-4 group">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:-translate-y-2 group-hover:shadow-md transition-all">
                <Map size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">1. Lên Kế Hoạch</h3>
              <p className="text-sm text-gray-500 max-w-xs leading-relaxed">Kéo thả các điểm dừng trên bản đồ. Dự toán chi phí tự động và mời bạn bè vào nhóm hành trình.</p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-4 group">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:-translate-y-2 group-hover:shadow-md transition-all">
                <Compass size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">2. Bám Sát Lộ Trình</h3>
              <p className="text-sm text-gray-500 max-w-xs leading-relaxed">GPS Live Tracking. Nhận cảnh báo đường xấu và khám phá các Hidden Gem khi đi ngang qua.</p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-4 group">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4 group-hover:-translate-y-2 group-hover:shadow-md transition-all">
                <Camera size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">3. Lưu Kỷ Niệm</h3>
              <p className="text-sm text-gray-500 max-w-xs leading-relaxed">Check-in một chạm. Tự động chia tiền (Split Bill) minh bạch và xuất album kỷ niệm chuẩn 4K.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED TRIPS GRID */}
      <section className="w-full bg-[#FAFAFA] py-24 px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 tracking-tight">Lộ trình nổi bật từ Cộng Đồng</h2>
              <p className="text-sm text-gray-500">Những cung đường được check-in nhiều nhất tháng này.</p>
            </div>
            <Link href="/explore">
              <span className="flex items-center gap-1 text-primary font-semibold text-sm hover:text-primary/80 transition-colors cursor-pointer mt-4 md:mt-0">
                Xem tất cả <ArrowRight size={16} />
              </span>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED_TRIPS.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </div>
      </section>
      
      {/* 4. FOOTER */}
      <footer className="w-full bg-[#111118] text-white py-16 px-6">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary inline-block"></span> Road Trip Planner
            </h3>
            <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
              Giải pháp toàn diện nhất dành cho cộng đồng Backpacker Việt Nam. Đồng hành cùng bạn trên mọi nẻo đường.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-gray-200">Tính năng</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="hover:text-white transition-colors cursor-pointer">Lập kế hoạch bản đồ</li>
              <li className="hover:text-white transition-colors cursor-pointer">Live Tracking</li>
              <li className="hover:text-white transition-colors cursor-pointer">Chia tiền nhóm</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-gray-200">Đối tác (B2B)</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="hover:text-white transition-colors cursor-pointer">Quảng cáo Homestay</li>
              <li className="hover:text-white transition-colors cursor-pointer">Chương trình Affiliate</li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1400px] mx-auto mt-16 pt-8 border-t border-white/10 text-center text-xs text-gray-500 font-medium">
          © 2026 Road Trip Planner. Designed for Vietnam Backpackers.
        </div>
      </footer>
    </div>
  );
}
