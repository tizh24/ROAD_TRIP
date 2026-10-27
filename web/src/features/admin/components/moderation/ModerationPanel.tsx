"use client";
import Link from "next/link";
import { WorkspacePage, EmptyWorkspace } from "@/components/shell/WorkspacePage";

export default function ModerationPanel() {
  return (
    <WorkspacePage
      title="Hàng đợi kiểm duyệt"
      description="Mọi quyết định cần có nội dung, bằng chứng và audit trail. Hành động chỉ khả dụng khi moderation API được kết nối."
      status="Chưa có dữ liệu live"
    >
      <EmptyWorkspace title="Hàng đợi đang trống" text="Khi có report hoặc nội dung chờ xét duyệt, chúng sẽ xuất hiện tại đây với mức độ ưu tiên, ngữ cảnh và các thao tác đã được kiểm soát.">
        <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
          Không approve, reject hoặc remove nội dung nếu không có data source và xác nhận action thật. Chế độ này không mô phỏng các quyết định kiểm duyệt hoặc audit event.
        </p>
        <Link href="/admin/settings" className="focus-ring mt-3 inline-flex min-h-11 items-center text-sm font-medium underline underline-offset-4">
          Mở Settings
        </Link>
      </EmptyWorkspace>
    </WorkspacePage>
  );
}
