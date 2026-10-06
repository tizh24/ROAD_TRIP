"use client";
import React from "react";
import { Wallet } from "lucide-react";

export default function PartnerBillingPanel() {
  return (
    <div className="min-h-full bg-[#f7f1e8] p-4 sm:p-8">
      <div className="mb-8">
        <p className="text-xs font-extrabold uppercase tracking-[.16em] text-primary">Partner workspace</p><h2 className="mt-3 text-3xl font-extrabold tracking-[-.03em] text-text-main">Thanh toán</h2>
        <p className="mt-3 text-sm text-text-sub">Phương thức thanh toán và hoá đơn chỉ hiện khi integration sẵn sàng.</p>
      </div>
      
      <div className="rounded-[1.75rem] border border-border-main bg-surface flex flex-col items-center justify-center py-20 text-center shadow-card">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-6 shadow-sm">
          <Wallet size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có dữ liệu thanh toán</h3>
        <p className="text-gray-500 text-sm max-w-md">Số dư, phương thức nạp tiền và hoá đơn sẽ xuất hiện khi hệ thống thanh toán đối tác được kết nối.</p>
      </div>
    </div>
  );
}
