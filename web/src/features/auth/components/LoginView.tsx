"use client";
import React from "react";
import CTAButton from "@/components/ui/CTAButton";
import Link from "next/link";
import { Map, ArrowRight } from "lucide-react";

export default function LoginView() {
  return (
    <div className="min-h-screen w-full flex bg-[#F8FAFC] font-sans">
      
      {/* LEFT: Auth Form */}
      <div className="w-full lg:w-[450px] flex flex-col justify-center px-8 sm:px-12 bg-white shadow-2xl z-10 relative">
        <div className="w-full max-w-sm mx-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 cursor-pointer mb-12 group inline-flex">
            <div className="bg-primary text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <Map size={24} className="fill-white/20" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-gray-900 leading-none uppercase">Road Trip</h1>
              <span className="text-[11px] font-bold text-primary tracking-widest mt-1 block uppercase">Planner</span>
            </div>
          </Link>

          <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Chào mừng trở lại!</h2>
          <p className="text-sm text-gray-500 mb-10 leading-relaxed font-medium">
            Đăng nhập để tiếp tục lên kế hoạch, lưu trữ lộ trình và chia sẻ chi phí cùng nhóm bè bạn.
          </p>

          <div className="space-y-4">
            <button className="w-full bg-white hover:bg-gray-50 border-2 border-gray-100 text-gray-700 font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-sm">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              Tiếp tục với Google
            </button>
            <button className="w-full bg-[#1877F2] hover:bg-[#1865F2] border-2 border-[#1877F2] text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-sm">
              <img src="https://www.svgrepo.com/show/448224/facebook.svg" alt="Facebook" className="w-5 h-5 invert" />
              Tiếp tục với Facebook
            </button>
            <button className="w-full bg-gray-900 hover:bg-black border-2 border-gray-900 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-sm">
              <img src="https://www.svgrepo.com/show/511330/apple-173.svg" alt="Apple" className="w-5 h-5 invert" />
              Tiếp tục với Apple
            </button>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100">
            <p className="text-xs text-center text-gray-400 font-medium leading-relaxed">
              Bằng việc đăng nhập, bạn đồng ý với <Link href="#" className="text-gray-900 hover:underline">Điều khoản dịch vụ</Link> và <Link href="#" className="text-gray-900 hover:underline">Chính sách bảo mật</Link> của chúng tôi.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT: Cover Image */}
      <div className="hidden lg:flex flex-1 relative bg-gray-900">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-80 mix-blend-overlay"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1541628951107-a55850900b9d?auto=format&fit=crop&w=2000&q=80")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-80" />
        
        <div className="relative z-10 flex flex-col justify-end p-20 w-full">
          <div className="max-w-xl">
            <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest rounded-full border border-white/20 mb-6">
              Khám Phá
            </span>
            <h2 className="text-5xl font-black text-white mb-6 leading-tight drop-shadow-xl tracking-tight">
              Bản đồ của riêng bạn. <br/>Kỷ niệm của cả nhóm.
            </h2>
            <p className="text-lg text-white/80 font-medium mb-10 max-w-md drop-shadow-md leading-relaxed">
              Tham gia cộng đồng hơn 100,000 backpackers. Clone lộ trình chỉ với 1 click và khởi hành ngay hôm nay.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                <img src="https://i.pravatar.cc/100?img=1" alt="User" className="w-10 h-10 rounded-full border-2 border-gray-900" />
                <img src="https://i.pravatar.cc/100?img=2" alt="User" className="w-10 h-10 rounded-full border-2 border-gray-900" />
                <img src="https://i.pravatar.cc/100?img=3" alt="User" className="w-10 h-10 rounded-full border-2 border-gray-900" />
                <div className="w-10 h-10 rounded-full border-2 border-gray-900 bg-white flex items-center justify-center text-xs font-bold text-gray-900">+1k</div>
              </div>
              <span className="text-sm font-bold text-white/80">Bạn bè đã tham gia</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
