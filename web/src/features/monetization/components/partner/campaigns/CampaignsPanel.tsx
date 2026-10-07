"use client";
import React from "react";
import { Target } from "lucide-react";

export default function CampaignsPanel() {
  return (
    <div className="min-h-full bg-background p-4 sm:p-8">
      <div className="mb-8">
        <p className="text-xs font-extrabold uppercase tracking-[.16em] text-primary">Partner workspace</p><h2 className="mt-3 text-3xl font-extrabold tracking-[-.03em] text-text-main">Chiến dịch</h2><p className="mt-3 text-sm text-text-sub">Quản lý hiển thị ưu tiên khi campaign service được kết nối.</p>
      </div>
      
      <div className="surface-card flex flex-col items-center justify-center border-dashed py-20 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-background-warm text-secondary shadow-sm">
          <Target size={32} />
        </div>
        <h3 className="mb-2 text-xl font-bold text-text-main">Chưa có chiến dịch mới nào</h3>
        <p className="max-w-md text-sm text-text-sub">Tạo chiến dịch sẽ khả dụng khi module quảng cáo được kết nối. Danh sách và trạng thái chiến dịch sẽ hiển thị tại đây.</p>
      </div>
    </div>
  );
}
