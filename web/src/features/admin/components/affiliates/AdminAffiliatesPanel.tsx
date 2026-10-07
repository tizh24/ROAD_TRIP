"use client";
import React from "react";
import { Link2 } from "lucide-react";

export default function AdminAffiliatesPanel() {
  return (
    <div className="mx-auto min-h-full max-w-[1400px] bg-background p-4 sm:p-8">
      <div className="mb-8">
        <p className="text-xs font-extrabold uppercase tracking-[.16em] text-secondary">Operations</p><h2 className="mt-3 text-3xl font-extrabold tracking-[-.03em] text-text-main">Affiliates</h2>
        <p className="mt-3 text-sm text-text-sub">Commission chỉ hiển thị khi affiliate integration được kích hoạt.</p>
      </div>
      
      <div className="surface-card flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary shadow-sm">
          <Link2 size={32} />
        </div>
        <h3 className="mb-2 text-xl font-bold text-text-main">Chưa có lượt chuyển đổi nào</h3>
        <p className="max-w-md text-sm text-text-sub">Tiền hoa hồng từ việc người dùng đặt vé/phòng qua app sẽ được ghi nhận tại đây.</p>
      </div>
    </div>
  );
}
