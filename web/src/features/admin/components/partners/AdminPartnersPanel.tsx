"use client";
import React from "react";
import { Users } from "lucide-react";

export default function AdminPartnersPanel() {
  return (
    <div className="min-h-full bg-[#f4f6f3] p-4 sm:p-8 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <p className="text-xs font-extrabold uppercase tracking-[.16em] text-secondary">Operations</p><h2 className="mt-3 text-3xl font-extrabold tracking-[-.03em] text-text-main">Đối tác</h2>
        <p className="mt-3 text-sm text-text-sub">Danh sách doanh nghiệp chỉ hiện khi partner directory được kết nối.</p>
      </div>
      
      <div className="rounded-[1.75rem] border border-border-main bg-surface flex flex-col items-center justify-center py-20 text-center shadow-card">
        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 mb-6 shadow-sm">
          <Users size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Hệ thống đang tải dữ liệu Partner</h3>
        <p className="text-gray-500 text-sm max-w-md">Danh sách các đối tác đã xác minh sẽ hiển thị ở đây.</p>
      </div>
    </div>
  );
}
