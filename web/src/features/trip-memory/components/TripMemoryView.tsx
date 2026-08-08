"use client";
import React from "react";
import CTAButton from "@/components/ui/CTAButton";
import ExpenseChip from "@/components/ui/ExpenseChip";
import { Receipt, Share2, Printer, CheckCircle2, CircleDashed, AlertCircle, Camera, MapPin, Coffee, Fuel, Bed } from "lucide-react";

export default function TripMemoryView() {
  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] pb-24 font-sans text-gray-900">
      {/* HEADER & COVER */}
      <div className="relative w-full h-[50vh] bg-gray-900">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-70 mix-blend-overlay"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1541628951107-a55850900b9d?auto=format&fit=crop&w=2560&q=100")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAFC] via-gray-900/30 to-transparent" />
        
        <div className="absolute bottom-8 left-0 w-full px-6">
          <div className="max-w-[1200px] mx-auto text-white text-center">
            <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold tracking-widest uppercase mb-4 border border-white/20 shadow-sm">
              Nhật ký Hành Trình
            </span>
            <h1 className="text-4xl md:text-6xl font-black drop-shadow-2xl mb-4 tracking-tight">Mùa Vàng Hà Giang</h1>
            <p className="text-sm md:text-base font-medium text-white/90 drop-shadow-md">350km • 5 Ngày • Đi cùng 5 chiến hữu</p>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* LEFT MAIN: Timeline & Album */}
        <div className="lg:col-span-8 space-y-16">
          
          {/* Split Bill Card */}
          <section className="bg-white p-8 md:p-10 rounded-[32px] shadow-sm border border-gray-100 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            
            <div className="flex items-center justify-center gap-2 mb-2 text-gray-900">
              <Receipt size={24} className="text-primary" />
              <h2 className="text-2xl font-black tracking-tight">Tổng kết Chi Phí</h2>
            </div>
            <p className="text-sm text-gray-500 mb-10 max-w-md mx-auto leading-relaxed">Hệ thống tự động tính toán dựa trên các điểm bạn đã check-in trên đường.</p>
            
            <div className="flex flex-wrap justify-center gap-10 md:gap-16 mb-10">
              <div className="text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Tổng chi toàn đoàn</p>
                <p className="text-3xl md:text-4xl font-black text-gray-900">8.500.000 đ</p>
              </div>
              <div className="hidden sm:block w-px h-16 bg-gray-100 mt-2" />
              <div className="text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Mỗi người cần chuyển</p>
                <p className="text-3xl md:text-4xl font-black text-primary">1.700.000 đ</p>
              </div>
            </div>

            <div className="flex justify-center gap-8 mb-10">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center"><Coffee size={20} /></div>
                <span className="text-xs font-bold text-gray-700">3.500k</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center"><Fuel size={20} /></div>
                <span className="text-xs font-bold text-gray-700">1.200k</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><Bed size={20} /></div>
                <span className="text-xs font-bold text-gray-700">2.800k</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8 border-t border-gray-100">
              <CTAButton variant="primary" className="bg-[#D82D8B] hover:bg-[#b01e6e] shadow-lg shadow-[#D82D8B]/20 font-bold px-8 py-3.5 rounded-xl">
                Thanh toán qua MoMo
              </CTAButton>
              <CTAButton variant="ghost" className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 font-bold px-8 py-3.5 rounded-xl transition-colors">
                Thanh toán qua ZaloPay
              </CTAButton>
            </div>
            
            <div className="mt-10 text-left bg-gray-50/50 p-6 rounded-[24px] border border-gray-100">
              <h4 className="font-bold text-gray-900 text-sm mb-5 tracking-tight">Trạng thái thu tiền (Đoàn 5 người)</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                  <span className="font-medium text-gray-900">Tuấn (Bạn)</span>
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 font-bold rounded-md text-[10px] uppercase tracking-wider">
                    <CheckCircle2 size={12} /> Đã thanh toán
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                  <span className="font-medium text-gray-900">Nam Nguyễn</span>
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 font-bold rounded-md text-[10px] uppercase tracking-wider">
                    <CircleDashed size={12} className="animate-spin-slow" /> Đang xử lý
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                  <span className="font-medium text-gray-900">Hải Phạm</span>
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 font-bold rounded-md text-[10px] uppercase tracking-wider">
                    <AlertCircle size={12} /> Chưa trả
                  </span>
                </div>
              </div>
              <button className="mt-5 text-xs font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5">
                Gửi thông báo nhắc nhở tự động
              </button>
            </div>
          </section>

          {/* Photo Scrapbook Album */}
          <section>
            <div className="flex items-center justify-center gap-3 mb-12">
              <Camera size={28} className="text-gray-900" />
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Album Hành Trình</h2>
            </div>
            
            <div className="space-y-20 relative">
              {/* Timeline Connector */}
              <div className="absolute left-1/2 -translate-x-1/2 top-0 w-px h-full bg-gray-200 -z-10 hidden md:block" />
              
              {/* Day 1 */}
              <div className="relative">
                <div className="flex justify-center mb-10">
                  <span className="bg-gray-900 text-white font-bold px-6 py-2 rounded-full shadow-lg text-sm tracking-wider uppercase z-10">Ngày 1</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="md:text-right pr-0 md:pr-10">
                    <div className="flex items-center md:justify-end gap-2 text-gray-400 mb-2">
                      <MapPin size={14} /> <span className="text-xs font-bold uppercase tracking-widest">Cổng Trời Quản Bạ</span>
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">Check-in Cổng Trời</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">Sương mù dày đặc nhưng cảnh quan từ trên cao nhìn xuống cực kỳ hùng vĩ.</p>
                  </div>
                  <div className="pl-0 md:pl-10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://images.unsplash.com/photo-1596700543598-68e37cb0cc2c?w=800&q=80" alt="Memory" className="rounded-3xl shadow-xl w-full object-cover aspect-[4/3] hover:scale-[1.02] transition-transform duration-500" />
                  </div>
                </div>
              </div>

              {/* Day 2 */}
              <div className="relative">
                <div className="flex justify-center mb-10">
                  <span className="bg-gray-900 text-white font-bold px-6 py-2 rounded-full shadow-lg text-sm tracking-wider uppercase z-10">Ngày 2</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="order-2 md:order-1 pr-0 md:pr-10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80" alt="Memory" className="rounded-3xl shadow-xl w-full object-cover aspect-[4/3] hover:scale-[1.02] transition-transform duration-500" />
                  </div>
                  <div className="order-1 md:order-2 md:text-left pl-0 md:pl-10">
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                      <MapPin size={14} /> <span className="text-xs font-bold uppercase tracking-widest">Đồng Văn</span>
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">Đêm lửa trại Đồng Văn</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">Uống rượu ngô, ăn thắng cố và giao lưu cùng người dân bản địa.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* RIGHT SIDEBAR: Travel Book Widget */}
        <div className="lg:col-span-4">
          <div className="sticky top-8 bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 text-center">
            <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight">In Sách Kỷ Niệm</h3>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              Biến toàn bộ nhật ký này thành một cuốn Photobook tuyệt đẹp gửi thẳng đến nhà bạn.
            </p>
            
            <div className="w-full aspect-[3/4] bg-gray-50 rounded-2xl border border-gray-100 mb-8 relative overflow-hidden group cursor-pointer shadow-inner">
              <div className="absolute inset-6 bg-white shadow-xl transform rotate-2 group-hover:rotate-6 transition-all duration-500 flex flex-col items-center p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1541628951107-a55850900b9d?w=400&q=80" alt="Book Cover" className="w-full flex-1 object-cover rounded-md grayscale group-hover:grayscale-0 transition-all duration-500" />
                <div className="pt-4 text-center">
                  <h4 className="font-black text-gray-900 text-sm tracking-tight uppercase">Mùa Vàng Hà Giang</h4>
                  <p className="text-[8px] text-gray-400 font-bold tracking-widest uppercase mt-1">Travel Book</p>
                </div>
              </div>
            </div>

            <CTAButton variant="primary" className="w-full py-4 rounded-xl shadow-lg shadow-primary/20 hover:-translate-y-1 transition-transform flex items-center justify-center gap-2">
              <Printer size={18} /> Đặt In Sách (350.000 đ)
            </CTAButton>
            <div className="flex items-center justify-center gap-6 mt-6">
              <button className="text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1.5">
                Xem bản PDF
              </button>
              <div className="w-1 h-1 rounded-full bg-gray-300" />
              <button className="text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1.5">
                <Share2 size={12} /> Chia sẻ Web
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
