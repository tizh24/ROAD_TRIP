"use client";
import React from "react";
import { usePathname } from "next/navigation";

export default function AdminHeader() {
  const pathname = usePathname();
  
  // Very basic breadcrumb/title generation
  const getTitle = () => {
    if (pathname === '/admin') return 'Overview';
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length > 1) {
      return parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
    }
    return 'Admin';
  };

  return (
    <header className="h-14 border-b border-border-main flex items-center justify-between px-6 bg-surface z-10 shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-xs text-text-sub font-medium">Admin /</span>
        <h1 className="text-lg font-semibold text-text-main capitalize">{getTitle()}</h1>
      </div>
      <div className="flex items-center gap-4">
        <span className="px-2.5 py-1 bg-gray-100 text-text-sub text-[11px] font-bold rounded-md border border-gray-200 uppercase tracking-wider">
          Super Admin
        </span>
      </div>
    </header>
  );
}
