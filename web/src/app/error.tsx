"use client";

import Link from "next/link";
import StatusPage from "@/components/ui/StatusPage";
import { Button } from "@/components/ui/button";

export default function RouteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <StatusPage
      title="Trang này không tải được"
      description="Đã có lỗi khi hiển thị trang. Bạn có thể thử tải lại hoặc quay về trang chủ."
    >
      <Button className="min-h-11" onClick={reset}>Thử lại</Button>
      <Button asChild variant="outline" className="min-h-11">
        <Link href="/">Về trang chủ</Link>
      </Button>
    </StatusPage>
  );
}
