"use client";
import React from "react";
import { Star } from "lucide-react";

export default function PartnerReviewsPanel() {
  return (
    <div className="min-h-full bg-background p-4 sm:p-8">
      <div className="mb-8">
        <p className="text-xs font-extrabold uppercase tracking-[.16em] text-primary">Partner workspace</p><h2 className="mt-3 text-3xl font-extrabold tracking-[-.03em] text-text-main">Đánh giá</h2>
        <p className="mt-3 text-sm text-text-sub">Phản hồi từ khách sẽ xuất hiện khi review được kích hoạt.</p>
      </div>
      
      <div className="surface-card flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 text-accent shadow-sm">
          <Star size={32} />
        </div>
        <h3 className="mb-2 text-xl font-bold text-text-main">Chưa có đánh giá nào</h3>
        <p className="max-w-md text-sm text-text-sub">Khi có người dùng check-in và để lại đánh giá trên lộ trình, chúng sẽ xuất hiện ở đây.</p>
      </div>
    </div>
  );
}
