import Link from "next/link";
import StatusPage from "@/components/ui/StatusPage";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <StatusPage
      code="404"
      title="Không tìm thấy trang hoặc chuyến đi"
      description="Địa chỉ bạn yêu cầu không tồn tại, đã bị xóa hoặc được đặt ở chế độ riêng tư bởi người tạo."
    >
      <Button asChild className="min-h-11">
        <Link href="/explore">Khám phá chuyến đi</Link>
      </Button>
      <Button asChild variant="outline" className="min-h-11">
        <Link href="/">Về trang chủ</Link>
      </Button>
    </StatusPage>
  );
}
