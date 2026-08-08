"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store, Rocket, Star, BarChart, CreditCard, Menu, X, ChevronLeft } from "lucide-react";

export default function PartnerSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const navItems = [
    { id: "overview", path: "/partner", icon: Store, label: "Tổng quan" },
    { id: "campaigns", path: "/partner/campaigns", icon: Rocket, label: "Chiến dịch Ads" },
    { id: "reviews", path: "/partner/reviews", icon: Star, label: "Đánh giá" },
    { id: "analytics", path: "/partner/analytics", icon: BarChart, label: "Phân tích Data" },
    { id: "billing", path: "/partner/billing", icon: CreditCard, label: "Thanh toán" },
  ];

  return (
    <>
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <button 
        className="lg:hidden fixed bottom-6 right-6 z-50 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/90 transition-transform active:scale-95"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} 
        ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
        bg-white border-r border-gray-100 flex flex-col transition-all duration-300 ease-in-out shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]
      `}>
        <div className="h-16 px-4 border-b border-gray-50 flex items-center justify-between">
          {(!isCollapsed || isMobileOpen) && (
            <div>
              <h2 className="text-[15px] font-bold text-gray-800 tracking-tight flex items-center gap-2 truncate">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary shadow-sm shrink-0"></span>
                B2B Partner
              </h2>
            </div>
          )}
          {(isCollapsed && !isMobileOpen) && (
             <span className="w-3 h-3 rounded-full bg-secondary mx-auto shrink-0 shadow-sm"></span>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {isCollapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
        
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map(item => {
            const isActive = pathname === item.path || (item.path !== '/partner' && pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.path}
                title={isCollapsed && !isMobileOpen ? item.label : undefined}
                className={`w-full flex items-center ${isCollapsed && !isMobileOpen ? 'justify-center px-0' : 'justify-start px-3.5 gap-3.5'} py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group ${
                  isActive 
                    ? "bg-secondary/10 text-secondary" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <Icon size={18} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} strokeWidth={isActive ? 2.5 : 2} />
                {(!isCollapsed || isMobileOpen) && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        
        {(!isCollapsed || isMobileOpen) && (
          <div className="p-4 border-t border-gray-50 bg-gray-50/50 m-4 rounded-xl text-center">
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Số dư Ads</p>
            <p className="text-lg font-black text-secondary mb-3">1.5M đ</p>
            <button className="w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold py-2 rounded-lg transition-colors shadow-sm">
              Nạp Thêm
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
