import React from "react";
import { CreditCard } from "lucide-react";

export default function ProfileBillingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-16 px-6 font-sans">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-black text-gray-900 mb-8">Thanh toán & Gói cước</h1>
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center text-orange-500 mb-6">
            <CreditCard size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Thanh toán an toàn qua VNPay</h2>
          <p className="text-sm text-gray-500">Chức năng nâng cấp gói Explorer Pass (49k/tháng) đang được tích hợp.</p>
        </div>
      </div>
    </div>
  );
}
