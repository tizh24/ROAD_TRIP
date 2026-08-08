"use client";
import React from "react";
import CTAButton from "@/components/ui/CTAButton";
import { Plus, Target, Rocket } from "lucide-react";

export default function CampaignsPanel() {
  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <p className="text-sm text-gray-500">Tạo và quản lý các vị trí hiển thị ưu tiên trên lộ trình của Backpacker.</p>
        <CTAButton variant="primary" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm w-full md:w-auto justify-center" onClick={() => alert('Form tạo Ads Campaign đang mở...')}>
          <Plus size={16} /> Tạo Chiến Dịch Mới
        </CTAButton>
      </div>
      
      <div className="bg-white rounded-2xl border border-gray-100 border-dashed flex flex-col items-center justify-center py-20 text-center shadow-sm">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-secondary mb-6 shadow-sm">
          <Target size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có chiến dịch mới nào</h3>
        <p className="text-gray-500 text-sm max-w-md mb-8">Bắt đầu tiếp cận hàng ngàn Backpacker đang lên kế hoạch đến Hà Giang ngay hôm nay.</p>
        <CTAButton variant="ghost" className="border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-xl px-6 py-2.5 flex items-center gap-2" onClick={() => alert('Đang mở file Hướng dẫn sử dụng...')}>
          <Rocket size={16} /> Xem Hướng Dẫn Quảng Cáo
        </CTAButton>
      </div>
    </div>
  );
}
