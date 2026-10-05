"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShieldAlert, Users, Link2, CreditCard, Settings, ChevronLeft, Menu, X } from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { id: "overview", path: "/admin", icon: LayoutDashboard, label: "Overview" },
    { id: "moderation", path: "/admin/moderation", icon: ShieldAlert, label: "Moderation" },
    { id: "partners", path: "/admin/partners", icon: Users, label: "B2B Partners" },
    { id: "affiliates", path: "/admin/affiliates", icon: Link2, label: "Affiliates" },
    { id: "finance", path: "/admin/finance", icon: CreditCard, label: "Finance" },
    { id: "settings", path: "/admin/settings", icon: Settings, label: "Configs" },
  ];

  return (
    <>
      {/* Mobile Toggle Overlay (Only visible on small screens when open) */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Hamburger (Visible only on small screens) */}
      <button 
        className="focus-ring lg:hidden fixed bottom-6 right-6 z-50 rounded-full bg-primary p-3 text-white shadow-card hover:bg-primary-hover transition-transform active:scale-95"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label={isMobileOpen ? "Đóng điều hướng quản trị" : "Mở điều hướng quản trị"}
        aria-expanded={isMobileOpen}
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Container */}
      <aside aria-label="Điều hướng quản trị" className={`
        fixed lg:static inset-y-0 left-0 z-50
        ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} 
        ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
        bg-surface border-r border-border-light flex flex-col transition-all duration-300 ease-in-out shrink-0 shadow-card
      `}>
        <div className="h-16 px-4 border-b border-gray-50 flex items-center justify-between">
          {(!isCollapsed || isMobileOpen) && (
            <h2 className="text-[15px] font-bold text-gray-800 tracking-tight flex items-center gap-2.5 truncate ml-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-sm shrink-0"></span>
              System Admin
            </h2>
          )}
          {(isCollapsed && !isMobileOpen) && (
             <span className="w-3 h-3 rounded-full bg-primary mx-auto shrink-0 shadow-sm"></span>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="focus-ring hidden lg:flex text-text-sub hover:text-text-main p-1.5 rounded-lg hover:bg-background-warm transition-colors"
            title="Toggle Sidebar"
            aria-label={isCollapsed ? "Mở rộng điều hướng quản trị" : "Thu gọn điều hướng quản trị"}
          >
            {isCollapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
        
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map(item => {
            const isActive = pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.path}
                onClick={() => setIsMobileOpen(false)}
                title={isCollapsed && !isMobileOpen ? item.label : undefined}
                className={`w-full flex items-center ${isCollapsed && !isMobileOpen ? 'justify-center px-0' : 'justify-start px-3.5 gap-3.5'} py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group ${
                  isActive 
                    ? "bg-primary/5 text-primary" 
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
          <div className="p-5 border-t border-gray-50 text-xs text-gray-400 truncate">
            <p>Admin Workspace v2.0</p>
          </div>
        )}
      </aside>
    </>
  );
}
