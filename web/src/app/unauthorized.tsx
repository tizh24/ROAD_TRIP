import Link from "next/link";
import StatusPage from "@/components/ui/StatusPage";
import { Button } from "@/components/ui/button";

export default function Unauthorized() {
  return (
    <StatusPage
      code="401"
      title="Yêu cầu đăng nhập"
      description="Bạn cần đăng nhập tài khoản Tripz để thực hiện thao tác hoặc truy cập vào nội dung bảo mật này."
    >
      <Button asChild className="min-h-11">
        <Link href="/login">Đăng nhập</Link>
      </Button>
      <Button asChild variant="outline" className="min-h-11">
        <Link href="/">Về trang chủ</Link>
      </Button>
    </StatusPage>
  );
}
