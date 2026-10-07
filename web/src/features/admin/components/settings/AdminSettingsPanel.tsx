"use client";
import React from "react";
import { Settings } from "lucide-react";

export default function AdminSettingsPanel() {
  return (
    <div className="mx-auto min-h-full max-w-[1400px] bg-background p-4 sm:p-8">
      <div className="mb-8">
        <p className="text-xs font-extrabold uppercase tracking-[.16em] text-secondary">Operations · Restricted</p><h2 className="mt-3 text-3xl font-extrabold tracking-[-.03em] text-text-main">Cấu hình hệ thống</h2>
        <p className="mt-3 text-sm text-text-sub">Feature flags, secrets và quyền hệ thống không được render hoặc chỉnh sửa từ UI khi chưa có integration an toàn.</p>
      </div>
      
      <div className="surface-card flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-background-warm text-text-sub shadow-sm">
          <Settings size={32} />
        </div>
        <h3 className="mb-2 text-xl font-bold text-text-main">Khu vực nhạy cảm</h3>
        <p className="max-w-md text-sm text-text-sub">Chỉ có Super Admin mới có quyền truy cập thay đổi các biến môi trường tại đây.</p>
      </div>
    </div>
  );
}
