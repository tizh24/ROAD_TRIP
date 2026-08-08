"use client";
import React, { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Bell, LogOut, Settings, User } from "lucide-react";

export default function PartnerHeader() {
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const getTitle = () => {
    if (pathname === '/partner') return 'Tổng quan Kinh Doanh';
    if (pathname.includes('/campaigns')) return 'Quản lý Chiến dịch';
    if (pathname.includes('/reviews')) return 'Đánh giá từ Backpacker';
    if (pathname.includes('/analytics')) return 'Phân tích Data';
    if (pathname.includes('/billing')) return 'Thanh toán & Hóa đơn';
    return 'Partner Dashboard';
  };

  return (
    <header className="h-16 border-b border-gray-100 flex items-center justify-between px-4 md:px-8 bg-white z-[60] shrink-0 relative">
      <div className="flex items-center gap-2">
        <h1 className="text-base md:text-lg font-bold text-gray-800 tracking-tight">{getTitle()}</h1>
      </div>
      
      <div className="flex items-center gap-3 md:gap-4">
        
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-all ${showNotifications ? 'bg-secondary/10 text-secondary ring-2 ring-secondary/20' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
          >
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute top-[48px] right-0 w-80 bg-white border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.1)] rounded-[20px] overflow-hidden z-50 animate-slide-in">
              <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-sm font-bold text-gray-900">Thông báo mới</h3>
                <span className="text-[10px] font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-md">1 chưa đọc</span>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                <div className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">🎉</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-0.5">Chiến dịch "Mùa lúa chín" đã được duyệt!</p>
                    <p className="text-xs text-gray-500">Quảng cáo của bạn sẽ bắt đầu phân phối trên lộ trình Hoàng Su Phì.</p>
                    <p className="text-[10px] text-gray-400 mt-2 font-medium">10 phút trước</p>
                  </div>
                </div>
              </div>
              <div className="p-3 text-center border-t border-gray-50 bg-gray-50/30">
                <button className="text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors">Xem tất cả</button>
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-gray-200 hidden md:block" />

        {/* Profile Avatar */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className={`flex items-center gap-3 transition-all p-1 rounded-full ${showProfileMenu ? 'ring-2 ring-gray-200 bg-gray-50' : 'hover:bg-gray-50'}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=100&q=80" alt="Avatar" className="w-9 h-9 rounded-full object-cover border border-gray-200 shadow-sm" />
            <div className="text-right hidden sm:block pr-2">
              <p className="text-sm font-semibold text-gray-800">A Páo Homestay</p>
              <p className="text-[10px] text-secondary font-bold uppercase tracking-widest leading-none">Premium</p>
            </div>
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute top-[52px] right-0 w-56 bg-white border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.1)] rounded-[20px] overflow-hidden z-50 animate-slide-in py-2">
              <button className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors flex items-center gap-3 group">
                <User size={16} className="text-gray-400 group-hover:text-gray-900 transition-colors" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Hồ sơ doanh nghiệp</span>
              </button>
              <button className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors flex items-center gap-3 group">
                <Settings size={16} className="text-gray-400 group-hover:text-gray-900 transition-colors" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Cài đặt thanh toán</span>
              </button>
              <div className="h-px bg-gray-100 my-2" />
              <button className="w-full text-left px-4 py-2.5 hover:bg-red-50 transition-colors flex items-center gap-3 group">
                <LogOut size={16} className="text-red-400 group-hover:text-red-600 transition-colors" />
                <span className="text-sm font-medium text-red-500 group-hover:text-red-700">Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
