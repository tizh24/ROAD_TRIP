"use client";
import React from "react";
import { Star, MessageSquare } from "lucide-react";

export default function PartnerReviewsPanel() {
  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Đánh giá của khách hàng</h2>
        <p className="text-sm text-gray-500">Xem và phản hồi đánh giá từ những backpacker đã ghé thăm doanh nghiệp của bạn.</p>
      </div>
      
      <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-20 text-center shadow-sm">
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-6 shadow-sm">
          <Star size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có đánh giá nào</h3>
        <p className="text-gray-500 text-sm max-w-md">Khi có người dùng check-in và để lại đánh giá trên lộ trình, chúng sẽ xuất hiện ở đây.</p>
      </div>
    </div>
  );
}
