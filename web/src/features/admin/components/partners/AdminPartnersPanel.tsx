"use client";
import React from "react";
import { Users } from "lucide-react";

export default function AdminPartnersPanel() {
  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">B2B Partners</h2>
        <p className="text-sm text-gray-500">Quản lý danh sách Homestay, Quán ăn, Nhà xe đang hợp tác quảng cáo.</p>
      </div>
      
      <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-20 text-center shadow-sm">
        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 mb-6 shadow-sm">
          <Users size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Hệ thống đang tải dữ liệu Partner</h3>
        <p className="text-gray-500 text-sm max-w-md">Danh sách các đối tác đã xác minh sẽ hiển thị ở đây.</p>
      </div>
    </div>
  );
}
