"use client";
import React from "react";
import { Wallet } from "lucide-react";

export default function PartnerBillingPanel() {
  return (
    <div className="min-h-full bg-background p-4 sm:p-8">
      <div className="mb-8">
        <p className="text-xs font-extrabold uppercase tracking-[.16em] text-primary">Partner workspace</p><h2 className="mt-3 text-3xl font-extrabold tracking-[-.03em] text-text-main">Thanh toán</h2>
        <p className="mt-3 text-sm text-text-sub">Phương thức thanh toán và hoá đơn chỉ hiện khi integration sẵn sàng.</p>
      </div>
      
      <div className="surface-card flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary shadow-sm">
          <Wallet size={32} />
        </div>
        <h3 className="mb-2 text-xl font-bold text-text-main">Chưa có dữ liệu thanh toán</h3>
        <p className="max-w-md text-sm text-text-sub">Số dư, phương thức nạp tiền và hoá đơn sẽ xuất hiện khi hệ thống thanh toán đối tác được kết nối.</p>
      </div>
    </div>
  );
}
