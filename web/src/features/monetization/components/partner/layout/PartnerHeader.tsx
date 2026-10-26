"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";

export default function PartnerHeader() {
  const pathname = usePathname();

  const getTitle = () => {
    if (pathname === "/partner") return "Tổng quan kinh doanh";
    if (pathname.includes("/campaigns")) return "Quản lý chiến dịch";
    if (pathname.includes("/reviews")) return "Đánh giá";
    if (pathname.includes("/analytics")) return "Phân tích";
    if (pathname.includes("/billing")) return "Thanh toán và hóa đơn";
    return "Không gian đối tác";
  };

  return (
    <header className="relative z-[60] flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-surface px-4 md:px-8">
      <h1 className="text-base font-bold tracking-tight text-text-main md:text-lg">{getTitle()}</h1>
      <form action="/auth/signout" method="post">
        <button
          type="submit"
          className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-bold text-text-sub hover:bg-background-warm hover:text-text-main"
        >
          <LogOut size={16} aria-hidden="true" />
          Đăng xuất
        </button>
      </form>
    </header>
  );
}
