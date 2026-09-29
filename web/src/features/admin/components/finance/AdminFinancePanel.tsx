"use client";
import React from "react";
import { CreditCard } from "lucide-react";

export default function AdminFinancePanel() {
  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tài chính (Finance)</h2>
        <p className="text-sm text-gray-500">Theo dõi dòng tiền nạp vào từ Ads, bán sách in (Travel Book), và doanh thu Subscriptions.</p>
      </div>
      
      <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-20 text-center shadow-sm">
        <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center text-teal-500 mb-6 shadow-sm">
          <CreditCard size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Tổng doanh thu: 0 đ</h3>
        <p className="text-gray-500 text-sm max-w-md">Bạn cần đợi dữ liệu thanh toán từ cổng VNPay và Stripe đồng bộ về máy chủ.</p>
      </div>
    </div>
  );
}
