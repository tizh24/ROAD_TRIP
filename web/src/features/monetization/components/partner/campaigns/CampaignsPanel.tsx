"use client";
import React from "react";
import { Target } from "lucide-react";

export default function CampaignsPanel() {
  return (
    <div className="min-h-full bg-[#f7f1e8] p-4 sm:p-8">
      <div className="mb-8">
        <p className="text-xs font-extrabold uppercase tracking-[.16em] text-primary">Partner workspace</p><h2 className="mt-3 text-3xl font-extrabold tracking-[-.03em] text-text-main">Chiến dịch</h2><p className="mt-3 text-sm text-text-sub">Quản lý hiển thị ưu tiên khi campaign service được kết nối.</p>
      </div>
      
      <div className="rounded-[1.75rem] border border-dashed border-border-main bg-surface flex flex-col items-center justify-center py-20 text-center shadow-card">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-secondary mb-6 shadow-sm">
          <Target size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có chiến dịch mới nào</h3>
        <p className="text-gray-500 text-sm max-w-md">Tạo chiến dịch sẽ khả dụng khi module quảng cáo được kết nối. Danh sách và trạng thái chiến dịch sẽ hiển thị tại đây.</p>
      </div>
    </div>
  );
}
