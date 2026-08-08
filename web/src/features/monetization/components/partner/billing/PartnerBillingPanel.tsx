"use client";
import React from "react";
import { CreditCard, Wallet } from "lucide-react";
import CTAButton from "@/components/ui/CTAButton";

export default function PartnerBillingPanel() {
  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán & Hóa đơn</h2>
        <p className="text-sm text-gray-500">Quản lý số dư tài khoản Ads và lịch sử giao dịch nạp tiền.</p>
      </div>
      
      <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-20 text-center shadow-sm">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-6 shadow-sm">
          <Wallet size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Số dư hiện tại: 1.500.000 đ</h3>
        <p className="text-gray-500 text-sm max-w-md mb-8">Nạp thêm tiền qua VNPay hoặc chuyển khoản ngân hàng để duy trì chiến dịch.</p>
        <CTAButton variant="primary" className="px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-md" onClick={() => alert('Đang chuyển hướng sang cổng thanh toán VNPay...')}>
          <CreditCard size={16} /> Nạp Tiền Ngay
        </CTAButton>
      </div>
    </div>
  );
}
