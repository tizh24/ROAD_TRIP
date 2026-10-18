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

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowNotifications(false);
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
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
    <header className="relative z-[60] flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-surface px-4 md:px-8">
      <div className="flex items-center gap-2">
        <h1 className="text-base md:text-lg font-bold text-text-main tracking-tight">{getTitle()}</h1>
      </div>
      
      <div className="flex items-center gap-3 md:gap-4">
        
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className={`focus-ring relative flex h-11 w-11 items-center justify-center rounded-full transition-all ${showNotifications ? 'bg-secondary/10 text-secondary ring-2 ring-secondary/20' : 'bg-background-warm text-text-sub hover:bg-secondary/10'}`}
            aria-label="Mở thông báo"
            aria-expanded={showNotifications}
          >
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-[52px] z-50 w-80 overflow-hidden rounded-2xl border border-border-light bg-surface shadow-card animate-slide-in">
              <div className="flex items-center justify-between border-b border-border-light bg-background-warm/50 p-4">
                <h3 className="text-sm font-bold text-text-main">Thông báo mới</h3>
                <span className="text-[10px] font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-md">1 chưa đọc</span>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                <div className="flex cursor-pointer gap-3 border-b border-border-light p-4 transition-colors hover:bg-background-warm">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary" aria-hidden="true">•</div>
                  <div>
                    <p className="mb-0.5 text-sm font-semibold text-text-main">Chiến dịch &quot;Mùa lúa chín&quot; đã được duyệt!</p>
                    <p className="text-xs text-text-sub">Quảng cáo của bạn sẽ bắt đầu phân phối trên lộ trình Hoàng Su Phì.</p>
                    <p className="mt-2 text-[10px] font-medium text-text-sub">10 phút trước</p>
                  </div>
                </div>
              </div>
              <div className="border-t border-border-light bg-background-warm/30 p-3 text-center">
                <button className="focus-ring rounded-md px-2 py-1 text-xs font-bold text-text-sub transition-colors hover:text-text-main">Xem tất cả</button>
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-border-main hidden md:block" />

        {/* Profile Avatar */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className={`focus-ring flex items-center gap-3 transition-all p-1 rounded-full ${showProfileMenu ? 'ring-2 ring-border-main bg-background-warm' : 'hover:bg-background-warm'}`}
            aria-label="Mở menu tài khoản đối tác"
            aria-expanded={showProfileMenu}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=100&q=80" alt="Avatar của A Páo Homestay" className="h-9 w-9 rounded-full border border-border-main object-cover shadow-sm" />
            <div className="text-right hidden sm:block pr-2">
              <p className="text-sm font-semibold text-text-main">A Páo Homestay</p>
              <p className="text-[10px] text-secondary font-bold uppercase tracking-widest leading-none">Premium</p>
            </div>
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 top-[52px] z-50 w-56 overflow-hidden rounded-2xl border border-border-light bg-surface py-2 shadow-card animate-slide-in">
              <button className="focus-ring group flex min-h-11 w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-background-warm">
                <User size={16} className="text-text-sub transition-colors group-hover:text-text-main" />
                <span className="text-sm font-medium text-text-sub group-hover:text-text-main">Hồ sơ doanh nghiệp</span>
              </button>
              <button className="focus-ring group flex min-h-11 w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-background-warm">
                <Settings size={16} className="text-text-sub transition-colors group-hover:text-text-main" />
                <span className="text-sm font-medium text-text-sub group-hover:text-text-main">Cài đặt thanh toán</span>
              </button>
              <div className="my-2 h-px bg-border-light" />
              <form action="/auth/signout" method="post">
                <button type="submit" className="focus-ring group flex min-h-11 w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-red-50">
                  <LogOut size={16} className="text-red-400 group-hover:text-red-600 transition-colors" />
                  <span className="text-sm font-medium text-red-500 group-hover:text-red-700">Đăng xuất</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
