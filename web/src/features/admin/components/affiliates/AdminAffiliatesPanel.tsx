"use client";
import React from "react";
import { Link2 } from "lucide-react";

export default function AdminAffiliatesPanel() {
  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Affiliates & Commission</h2>
        <p className="text-sm text-gray-500">Quản lý doanh thu từ Booking, Agoda, Klook và Vexere.</p>
      </div>
      
      <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-20 text-center shadow-sm">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-6 shadow-sm">
          <Link2 size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có lượt chuyển đổi nào</h3>
        <p className="text-gray-500 text-sm max-w-md">Tiền hoa hồng từ việc người dùng đặt vé/phòng qua app sẽ được ghi nhận tại đây.</p>
      </div>
    </div>
  );
}
