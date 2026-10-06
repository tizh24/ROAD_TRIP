"use client";
import React from "react";
import { Target } from "lucide-react";

export default function CampaignsPanel() {
  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto animate-fade-in-up">
      <div className="mb-8">
        <p className="text-sm text-gray-500">Tạo và quản lý các vị trí hiển thị ưu tiên trên lộ trình của Backpacker.</p>
      </div>
      
      <div className="bg-white rounded-2xl border border-gray-100 border-dashed flex flex-col items-center justify-center py-20 text-center shadow-sm">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-secondary mb-6 shadow-sm">
          <Target size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có chiến dịch mới nào</h3>
        <p className="text-gray-500 text-sm max-w-md">Tạo chiến dịch sẽ khả dụng khi module quảng cáo được kết nối. Danh sách và trạng thái chiến dịch sẽ hiển thị tại đây.</p>
      </div>
    </div>
  );
}
