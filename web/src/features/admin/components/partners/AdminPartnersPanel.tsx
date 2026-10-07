"use client";
import React from "react";
import { Users } from "lucide-react";

export default function AdminPartnersPanel() {
  return (
    <div className="mx-auto min-h-full max-w-[1400px] bg-background p-4 sm:p-8">
      <div className="mb-8">
        <p className="text-xs font-extrabold uppercase tracking-[.16em] text-secondary">Operations</p><h2 className="mt-3 text-3xl font-extrabold tracking-[-.03em] text-text-main">Đối tác</h2>
        <p className="mt-3 text-sm text-text-sub">Danh sách doanh nghiệp chỉ hiện khi partner directory được kết nối.</p>
      </div>
      
      <div className="surface-card flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-secondary/10 text-secondary shadow-sm">
          <Users size={32} />
        </div>
        <h3 className="mb-2 text-xl font-bold text-text-main">Hệ thống đang tải dữ liệu Partner</h3>
        <p className="max-w-md text-sm text-text-sub">Danh sách các đối tác đã xác minh sẽ hiển thị ở đây.</p>
      </div>
    </div>
  );
}
