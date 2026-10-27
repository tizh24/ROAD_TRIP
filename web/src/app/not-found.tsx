import Link from "next/link";
import { Compass, Home, MapPinOff } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-accent text-primary flex items-center justify-center mb-6 shadow-sm">
        <MapPinOff size={32} />
      </div>

      <span className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
        Mã lỗi 404
      </span>
      <h1 className="text-3xl font-extrabold text-foreground mb-3">
        Không tìm thấy trang hoặc chuyến đi
      </h1>
      <p className="text-muted-foreground max-w-md mb-8 leading-relaxed">
        Địa chỉ bạn yêu cầu không tồn tại, đã bị xóa hoặc được đặt ở chế độ riêng tư
        bởi người tạo.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs sm:max-w-md justify-center">
        <Link
          href="/explore"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Compass size={18} />
          Khám phá chuyến đi
        </Link>
        <Link
          href="/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-border text-foreground font-medium hover:bg-card transition-colors"
        >
          <Home size={18} />
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
