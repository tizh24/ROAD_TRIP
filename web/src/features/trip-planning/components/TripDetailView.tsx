"use client";
import React, { useState } from "react";
import CTAButton from "@/components/ui/CTAButton";
import AvatarCluster from "@/components/ui/AvatarCluster";
import StatBadge from "@/components/ui/StatBadge";
import Link from "next/link";
import { Lock, Navigation, Star, ShieldCheck, MapPin, Map as MapIcon, ChevronRight } from "lucide-react";

export default function TripDetailView() {
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] pb-24 overflow-x-hidden relative font-sans">
      
      {/* LOGIN GATE MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowLoginModal(false)} />
          <div className="relative bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Lock size={28} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Đăng nhập để Clone</h2>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              Lưu lộ trình này vào Workspace của bạn để chỉnh sửa các điểm dừng, tính tiền và mời bạn bè tham gia.
            </p>
            <div className="space-y-3">
              <Link href="/planner/1" className="block">
                <CTAButton variant="primary" className="w-full py-3.5 rounded-xl text-sm shadow-md" onClick={() => setShowLoginModal(false)}>
                  Đăng nhập bằng Google
                </CTAButton>
              </Link>
              <button onClick={() => setShowLoginModal(false)} className="text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors pt-2">
                Bỏ qua
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. HERO MAP HEADER (Immersive Visual) */}
      <div className="relative w-full h-[50vh] sm:h-[60vh] lg:h-[65vh] bg-gray-900">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80 mix-blend-overlay"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1626021200230-01d0c1598f1f?auto=format&fit=crop&w=2560&q=100")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111118] via-gray-900/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full px-6 pb-12 lg:pb-16">
          <div className="max-w-[1200px] mx-auto text-white">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="px-4 py-1.5 bg-primary text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-primary/30">Hà Giang</span>
              <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold rounded-full">Đèo Hiểm Trở</span>
              <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold rounded-full">Mùa Vàng</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black leading-[1.1] mb-8 max-w-4xl tracking-tight drop-shadow-2xl">
              Vòng Lặp Hà Giang <br className="hidden md:block"/> 5 Ngày 4 Đêm
            </h1>
            
            <div className="flex flex-wrap items-center gap-8">
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://i.pravatar.cc/150?u=2" alt="Author" className="w-12 h-12 rounded-full border-2 border-white/20 object-cover shadow-xl" />
                <div>
                  <p className="text-[10px] text-white/50 uppercase tracking-widest font-black mb-0.5">Người tạo</p>
                  <p className="text-sm font-bold text-gray-100">Phượt Thủ 99</p>
                </div>
              </div>
              
              <div className="hidden sm:block h-10 w-px bg-white/10" />
              
              <div className="flex items-center gap-4">
                <AvatarCluster size="md" members={[
                  { name: "A", avatar: "https://i.pravatar.cc/150?u=4" },
                  { name: "B", avatar: "https://i.pravatar.cc/150?u=5" },
                  { name: "C", avatar: "https://i.pravatar.cc/150?u=6" },
                ]} />
                <div className="text-sm text-gray-300 font-medium">Đã đi cùng <span className="font-bold text-white">5 người</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT & SIDEBAR */}
      <div className="max-w-[1200px] mx-auto px-6 mt-12 flex flex-col lg:flex-row gap-12 lg:gap-16 relative">
        
        {/* Left: Editorial & Itinerary */}
        <div className="flex-1 space-y-16">
          
          {/* Overview */}
          <section className="bg-white p-8 md:p-10 rounded-[32px] shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <MapIcon size={24} className="text-primary" />
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Tổng quan lộ trình</h2>
            </div>
            <p className="text-base text-gray-600 leading-relaxed mb-8">
              Hà Giang Loop là một trong những cung đường hùng vĩ nhất Đông Nam Á. 
              Trải qua những con đèo uốn lượn ngoạn mục, bạn sẽ được chiêm ngưỡng cột cờ Lũng Cú, 
              sông Nho Quế xanh ngắt dưới hẻm Tu Sản, và những bản làng mộc mạc của đồng bào dân tộc.
            </p>
            <div className="flex flex-wrap gap-4 pt-8 border-t border-gray-100">
              <StatBadge variant="duration" value="5 Ngày 4 Đêm" />
              <StatBadge variant="distance" value="350 km" />
              <StatBadge variant="cost" value="1.500.000 đ" />
            </div>
          </section>

          {/* Itinerary Timeline */}
          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-10 tracking-tight">Lịch trình chi tiết</h2>
            
            <div className="space-y-0 relative">
              {/* Vertical Timeline Line */}
              <div className="absolute top-0 bottom-0 left-[23px] w-0.5 bg-gray-200" />

              {/* Day 1 */}
              <div className="relative pl-14 pb-16 group">
                <div className="absolute top-0 left-[16px] w-4 h-4 rounded-full bg-primary ring-4 ring-white shadow-sm z-10" />
                <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight group-hover:text-primary transition-colors">Ngày 1: Hà Giang - Quản Bạ - Yên Minh</h3>
                <p className="text-sm text-gray-500 mb-8 max-w-2xl leading-relaxed">
                  Khởi hành từ thành phố Hà Giang, check-in KM0, sau đó vượt dốc Bắc Sum để lên tới cổng trời Quản Bạ.
                </p>
                
                <div className="space-y-5 max-w-3xl">
                  {/* Stop 1 */}
                  <div className="flex flex-col sm:flex-row gap-5 bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow group/card cursor-pointer relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover/card:bg-primary transition-colors" />
                    <div className="w-full sm:w-32 h-40 sm:h-32 shrink-0 rounded-[16px] bg-gray-100 overflow-hidden relative">
                      <div className="absolute top-3 left-3 w-7 h-7 bg-white/90 backdrop-blur-md text-gray-900 rounded-full flex items-center justify-center font-bold text-xs shadow-sm z-10">1</div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="https://images.unsplash.com/photo-1596700543598-68e37cb0cc2c?w=400&q=80" alt="Quản Bạ" className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="flex flex-col justify-center flex-1">
                      <h4 className="font-bold text-gray-900 text-lg mb-2">Cổng trời Quản Bạ</h4>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">Điểm dừng chân ngắm Núi Đôi cô tiên tuyệt đẹp từ trên cao. Cần cẩn thận đoạn sương mù.</p>
                      <div className="flex items-center gap-3 mt-auto">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded-md flex items-center gap-1.5">
                          Dự kiến 1 tiếng
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Stop 2 */}
                  <div className="flex flex-col sm:flex-row gap-5 bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow group/card cursor-pointer relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover/card:bg-primary transition-colors" />
                    <div className="w-full sm:w-32 h-40 sm:h-32 shrink-0 rounded-[16px] bg-gray-100 overflow-hidden relative">
                      <div className="absolute top-3 left-3 w-7 h-7 bg-white/90 backdrop-blur-md text-gray-900 rounded-full flex items-center justify-center font-bold text-xs shadow-sm z-10">2</div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&q=80" alt="Yên Minh" className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="flex flex-col justify-center flex-1">
                      <h4 className="font-bold text-gray-900 text-lg mb-2">Rừng thông Yên Minh</h4>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">Được ví như Đà Lạt thu nhỏ của miền Bắc. Nơi lý tưởng để cắm trại nghỉ trưa.</p>
                      <div className="flex items-center gap-3 mt-auto">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded-md flex items-center gap-1.5">
                          Nghỉ đêm
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right: Sticky Sidebar CTA & Partners */}
        <div className="w-full lg:w-[400px] shrink-0">
          <div className="sticky top-8 bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            
            <div className="mb-10">
              <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Sẵn sàng khởi hành?</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-8">
                Sao chép lộ trình này vào tài khoản của bạn để chỉnh sửa các điểm dừng theo ý thích.
              </p>
              
              <CTAButton variant="primary" className="w-full py-4 text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 flex items-center justify-center gap-2" onClick={() => setShowLoginModal(true)}>
                <Navigation size={18} /> Clone Lộ Trình Này
              </CTAButton>
            </div>
            
            <div className="pt-8 border-t border-gray-100">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-6 flex items-center gap-3">
                <span className="flex-1 h-px bg-gray-100" />
                Đối tác tin cậy
                <span className="flex-1 h-px bg-gray-100" />
              </span>
              
              <div className="space-y-4">
                {/* B2B Partner 1 */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-orange-50/50 rounded-[24px] transition-colors cursor-pointer border border-transparent hover:border-orange-100 group relative">
                  <div className="absolute -top-2.5 -right-2 bg-gradient-to-r from-orange-500 to-primary text-white text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm z-10 flex items-center gap-1">
                    <ShieldCheck size={10} /> Tài Trợ
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=100&q=80" alt="Homestay" className="w-16 h-16 rounded-[16px] object-cover shadow-sm group-hover:scale-105 transition-transform duration-300" />
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-primary transition-colors">A Páo Homestay</h4>
                    <span className="inline-block text-[10px] bg-orange-100/50 text-orange-700 font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                      Giảm 10% khi Clone
                    </span>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-primary transition-colors" />
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
