"use client";
import React from "react";
import { Settings } from "lucide-react";

export default function AdminSettingsPanel() {
  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Cấu hình hệ thống (Configs)</h2>
        <p className="text-sm text-gray-500">Thiết lập Feature flags, API Keys (VietMap, Stripe) và quản lý phân quyền Admin.</p>
      </div>
      
      <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-20 text-center shadow-sm">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-500 mb-6 shadow-sm">
          <Settings size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Khu vực nhạy cảm</h3>
        <p className="text-gray-500 text-sm max-w-md">Chỉ có Super Admin mới có quyền truy cập thay đổi các biến môi trường tại đây.</p>
      </div>
    </div>
  );
}
