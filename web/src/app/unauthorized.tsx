import Link from "next/link";
import { Lock, LogIn, Home } from "lucide-react";

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-accent text-primary flex items-center justify-center mb-6 shadow-sm">
        <Lock size={32} />
      </div>

      <span className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
        Mã lỗi 401
      </span>
      <h1 className="text-3xl font-extrabold text-foreground mb-3">
        Yêu cầu đăng nhập
      </h1>
      <p className="text-muted-foreground max-w-md mb-8 leading-relaxed">
        Bạn cần đăng nhập tài khoản Tripz để thực hiện thao tác hoặc truy cập vào nội
        dung bảo mật này.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs sm:max-w-md justify-center">
        <Link
          href="/login"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <LogIn size={18} />
          Đăng nhập ngay
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
