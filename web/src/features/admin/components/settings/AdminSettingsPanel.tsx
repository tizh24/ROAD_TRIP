"use client";
import React from "react";
import { Settings } from "lucide-react";

export default function AdminSettingsPanel() {
  return (
    <div className="min-h-full bg-[#f4f6f3] p-4 sm:p-8 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <p className="text-xs font-extrabold uppercase tracking-[.16em] text-secondary">Operations · Restricted</p><h2 className="mt-3 text-3xl font-extrabold tracking-[-.03em] text-text-main">Cấu hình hệ thống</h2>
        <p className="mt-3 text-sm text-text-sub">Feature flags, secrets và quyền hệ thống không được render hoặc chỉnh sửa từ UI khi chưa có integration an toàn.</p>
      </div>
      
      <div className="rounded-[1.75rem] border border-border-main bg-surface flex flex-col items-center justify-center py-20 text-center shadow-card">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-500 mb-6 shadow-sm">
          <Settings size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Khu vực nhạy cảm</h3>
        <p className="text-gray-500 text-sm max-w-md">Chỉ có Super Admin mới có quyền truy cập thay đổi các biến môi trường tại đây.</p>
      </div>
    </div>
  );
}
