"use client";
import React from "react";
import { BarChart3 } from "lucide-react";

export default function PartnerAnalyticsPanel() {
  return (
    <div className="min-h-full bg-background p-4 sm:p-8">
      <div className="mb-8">
        <p className="text-xs font-extrabold uppercase tracking-[.16em] text-primary">Partner workspace</p><h2 className="mt-3 text-3xl font-extrabold tracking-[-.03em] text-text-main">Phân tích</h2>
        <p className="mt-3 text-sm text-text-sub">Chỉ số hiệu quả sẽ xuất hiện khi có nguồn dữ liệu được kết nối.</p>
      </div>
      
      <div className="surface-card flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-info/10 text-info shadow-sm">
          <BarChart3 size={32} />
        </div>
        <h3 className="mb-2 text-xl font-bold text-text-main">Đang thu thập dữ liệu</h3>
        <p className="max-w-md text-sm text-text-sub">Biểu đồ sẽ hiển thị khi chiến dịch của bạn bắt đầu có lượt tương tác đầu tiên.</p>
      </div>
    </div>
  );
}
