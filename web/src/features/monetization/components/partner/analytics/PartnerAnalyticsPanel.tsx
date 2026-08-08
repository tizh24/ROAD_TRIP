"use client";
import React from "react";
import { BarChart3, TrendingUp } from "lucide-react";

export default function PartnerAnalyticsPanel() {
  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Phân tích dữ liệu</h2>
        <p className="text-sm text-gray-500">Thống kê chi tiết lượng người dùng xem, click và check-in vào doanh nghiệp của bạn.</p>
      </div>
      
      <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-20 text-center shadow-sm">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-6 shadow-sm">
          <BarChart3 size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Đang thu thập dữ liệu</h3>
        <p className="text-gray-500 text-sm max-w-md">Biểu đồ sẽ hiển thị khi chiến dịch của bạn bắt đầu có lượt tương tác đầu tiên.</p>
      </div>
    </div>
  );
}
