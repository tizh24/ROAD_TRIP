"use client";

import { CreditCard, ShieldCheck } from "lucide-react";

export default function AdminFinancePanel() {
  return <div className="min-h-full bg-background p-4 sm:p-8"><div className="mx-auto max-w-6xl"><header className="border-b border-border pb-8"><p className="text-xs font-extrabold uppercase tracking-[.16em] text-foreground">Operations · Restricted</p><h1 className="mt-3 text-4xl font-extrabold tracking-[-.04em] text-foreground">Tài chính</h1><p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Doanh thu, invoice và reconciliation chỉ hiển thị khi finance data source được kết nối và quyền truy cập hợp lệ.</p></header><section className="surface-card mt-8 p-7"><CreditCard className="text-foreground" size={27} /><h2 className="mt-6 text-2xl font-extrabold">Chưa có nguồn dữ liệu tài chính</h2><p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">Không hiển thị doanh thu bằng dữ liệu mẫu. Khi integration hoàn tất, báo cáo sẽ có khoảng thời gian, trạng thái đồng bộ và audit metadata.</p><div className="mt-7 flex gap-3 rounded-lg bg-muted p-4 text-sm text-muted-foreground"><ShieldCheck className="shrink-0 text-foreground" size={18} />Dữ liệu thanh toán không được expose ở giao diện khi chưa được xác thực.</div></section></div></div>;
}
