"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store, Rocket, Star, BarChart, CreditCard, Menu, X, ChevronLeft } from "lucide-react";

export default function PartnerSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsMobileOpen(false);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

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
        className="focus-ring lg:hidden fixed bottom-6 right-6 z-50 rounded-full bg-primary-strong p-3 text-white shadow-card hover:bg-primary-strong/90 transition-transform active:scale-95"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label={isMobileOpen ? "Đóng điều hướng đối tác" : "Mở điều hướng đối tác"}
        aria-expanded={isMobileOpen}
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside aria-label="Điều hướng đối tác" className={`
        fixed lg:static inset-y-0 left-0 z-50
        ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} 
        ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
        bg-surface border-r border-border-light flex flex-col transition-all duration-300 ease-in-out shrink-0 shadow-card
      `}>
        <div className="h-16 px-4 border-b border-border-light flex items-center justify-between">
          {(!isCollapsed || isMobileOpen) && (
            <div>
              <h2 className="text-[15px] font-bold text-text-main tracking-tight flex items-center gap-2 truncate">
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
            className="focus-ring hidden lg:flex text-text-sub hover:text-text-main p-1.5 rounded-lg hover:bg-background-warm transition-colors"
            aria-label={isCollapsed ? "Mở rộng điều hướng đối tác" : "Thu gọn điều hướng đối tác"}
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
                onClick={() => setIsMobileOpen(false)}
                title={isCollapsed && !isMobileOpen ? item.label : undefined}
                className={`flex min-h-11 w-full items-center ${isCollapsed && !isMobileOpen ? 'justify-center px-0' : 'justify-start px-3.5 gap-3.5'} py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group ${
                  isActive 
                    ? "bg-secondary/10 text-secondary" 
                    : "text-text-sub hover:bg-background-warm hover:text-text-main"
                }`}
              >
                <Icon size={18} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} strokeWidth={isActive ? 2.5 : 2} />
                {(!isCollapsed || isMobileOpen) && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        
      </aside>
    </>
  );
}
