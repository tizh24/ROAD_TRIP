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
    <header className="z-10 flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-surface px-4 md:px-8">
      <div className="flex items-center gap-2">
        <span className="text-xs text-text-sub font-medium">Admin /</span>
        <h1 className="text-lg font-semibold text-text-main capitalize">{getTitle()}</h1>
      </div>
      <div className="flex items-center gap-4">
        <span className="rounded-full border border-border-main bg-background-warm px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-text-sub">
          Super Admin
        </span>
      </div>
    </header>
  );
}
