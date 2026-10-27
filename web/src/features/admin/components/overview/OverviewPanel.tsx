"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { WorkspacePage } from "@/components/shell/WorkspacePage";

const areas = [
  { href: "/admin/moderation", name: "Kiểm duyệt", text: "Xem hàng đợi nội dung và xử lý theo quyền quản trị." },
  { href: "/admin/partners", name: "Đối tác", text: "Quản lý không gian và trạng thái đối tác." },
  { href: "/admin/affiliates", name: "Affiliates", text: "Theo dõi chương trình liên kết khi dữ liệu có sẵn." },
  { href: "/admin/finance", name: "Tài chính", text: "Xem dữ liệu tài chính theo quyền truy cập." },
] as const;

export default function OverviewPanel() {
  return (
    <WorkspacePage title="Bảng điều hành" description="Đi tới đúng không gian tác nghiệp. Chỉ dữ liệu được kết nối và được cấp quyền mới hiển thị tại từng khu vực.">
      <ul className="grid gap-1">
        {areas.map(({ href, name, text }, index) => (
          <li key={href} className={`rounded-lg ${index % 2 === 0 ? "bg-muted" : "bg-muted/50"}`}>
            <Link href={href} className="focus-ring flex min-h-20 items-center justify-between gap-6 rounded-lg px-5 py-4 transition-colors hover:bg-border/60">
              <span>
                <span className="block text-lg font-medium">{name}</span>
                <span className="block text-sm text-muted-foreground">{text}</span>
              </span>
              <ArrowUpRight className="size-5 shrink-0" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-sm text-muted-foreground">Cấu hình vận hành và quyền truy cập nằm trong Settings.</p>
    </WorkspacePage>
  );
}
