"use client";
import React from "react";
import { BarChart3 } from "lucide-react";

export default function PartnerAnalyticsPanel() {
  return (
    <div className="min-h-full bg-[#f7f1e8] p-4 sm:p-8">
      <div className="mb-8">
        <p className="text-xs font-extrabold uppercase tracking-[.16em] text-primary">Partner workspace</p><h2 className="mt-3 text-3xl font-extrabold tracking-[-.03em] text-text-main">Phân tích</h2>
        <p className="mt-3 text-sm text-text-sub">Chỉ số hiệu quả sẽ xuất hiện khi có nguồn dữ liệu được kết nối.</p>
      </div>
      
      <div className="rounded-[1.75rem] border border-border-main bg-surface flex flex-col items-center justify-center py-20 text-center shadow-card">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-6 shadow-sm">
          <BarChart3 size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Đang thu thập dữ liệu</h3>
        <p className="text-gray-500 text-sm max-w-md">Biểu đồ sẽ hiển thị khi chiến dịch của bạn bắt đầu có lượt tương tác đầu tiên.</p>
      </div>
    </div>
  );
}
