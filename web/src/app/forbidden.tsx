import Link from "next/link";
import StatusPage from "@/components/ui/StatusPage";
import { Button } from "@/components/ui/button";

export default function Forbidden() {
  return (
    <StatusPage
      code="403"
      title="Không có quyền truy cập"
      description="Tài khoản của bạn không có đủ đặc quyền hoặc vai trò quản trị để truy cập trang hoặc thao tác này."
    >
      <Button asChild className="min-h-11">
        <Link href="/dashboard">Về bảng điều khiển</Link>
      </Button>
      <Button asChild variant="outline" className="min-h-11">
        <Link href="/">Về trang chủ</Link>
      </Button>
    </StatusPage>
  );
}
