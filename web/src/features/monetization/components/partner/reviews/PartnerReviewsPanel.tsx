"use client";
import React from "react";
import { Star } from "lucide-react";

export default function PartnerReviewsPanel() {
  return (
    <div className="min-h-full bg-[#f7f1e8] p-4 sm:p-8">
      <div className="mb-8">
        <p className="text-xs font-extrabold uppercase tracking-[.16em] text-primary">Partner workspace</p><h2 className="mt-3 text-3xl font-extrabold tracking-[-.03em] text-text-main">Đánh giá</h2>
        <p className="mt-3 text-sm text-text-sub">Phản hồi từ khách sẽ xuất hiện khi review được kích hoạt.</p>
      </div>
      
      <div className="rounded-[1.75rem] border border-border-main bg-surface flex flex-col items-center justify-center py-20 text-center shadow-card">
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-6 shadow-sm">
          <Star size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có đánh giá nào</h3>
        <p className="text-gray-500 text-sm max-w-md">Khi có người dùng check-in và để lại đánh giá trên lộ trình, chúng sẽ xuất hiện ở đây.</p>
      </div>
    </div>
  );
}
