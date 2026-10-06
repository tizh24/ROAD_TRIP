"use client";
import React from "react";
import { Link2 } from "lucide-react";

export default function AdminAffiliatesPanel() {
  return (
    <div className="min-h-full bg-[#f4f6f3] p-4 sm:p-8 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <p className="text-xs font-extrabold uppercase tracking-[.16em] text-secondary">Operations</p><h2 className="mt-3 text-3xl font-extrabold tracking-[-.03em] text-text-main">Affiliates</h2>
        <p className="mt-3 text-sm text-text-sub">Commission chỉ hiển thị khi affiliate integration được kích hoạt.</p>
      </div>
      
      <div className="rounded-[1.75rem] border border-border-main bg-surface flex flex-col items-center justify-center py-20 text-center shadow-card">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-6 shadow-sm">
          <Link2 size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có lượt chuyển đổi nào</h3>
        <p className="text-gray-500 text-sm max-w-md">Tiền hoa hồng từ việc người dùng đặt vé/phòng qua app sẽ được ghi nhận tại đây.</p>
      </div>
    </div>
  );
}
