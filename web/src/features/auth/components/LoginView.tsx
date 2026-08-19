"use client";
import React, { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { LoaderCircle, LogIn, Map } from "lucide-react";
import { login, type LoginState } from "@/features/auth/actions";

const initialState: LoginState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-gray-900 hover:bg-black disabled:cursor-not-allowed disabled:opacity-60 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-sm"
    >
      {pending ? (
        <LoaderCircle size={18} className="animate-spin" />
      ) : (
        <LogIn size={18} />
      )}
      {pending ? "Đang đăng nhập..." : "Đăng nhập"}
    </button>
  );
}

type LoginViewProps = {
  authError?: "callback" | "session_expired";
  nextPath?: string;
};

const authErrorMessages = {
  callback: "Liên kết đăng nhập không hợp lệ hoặc đã hết hạn.",
  session_expired: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
} as const;

export default function LoginView({ authError, nextPath }: LoginViewProps) {
  const [state, formAction] = useActionState(login, initialState);

  return (
    <div className="min-h-screen w-full flex bg-[#F8FAFC] font-sans">
      
      {/* LEFT: Auth Form */}
      <div className="w-full lg:w-[450px] flex flex-col justify-center px-8 sm:px-12 bg-white shadow-2xl z-10 relative">
        <div className="w-full max-w-sm mx-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 cursor-pointer mb-12 group inline-flex">
            <div className="bg-primary text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <Map size={24} className="fill-white/20" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-gray-900 leading-none uppercase">Road Trip</h1>
              <span className="text-[11px] font-bold text-primary tracking-widest mt-1 block uppercase">Planner</span>
            </div>
          </Link>

          <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Chào mừng trở lại!</h2>
          <p className="text-sm text-gray-500 mb-10 leading-relaxed font-medium">
            Đăng nhập để tiếp tục lên kế hoạch, lưu trữ lộ trình và chia sẻ chi phí cùng nhóm bè bạn.
          </p>

          <form action={formAction} className="space-y-5">
            {nextPath ? (
              <input type="hidden" name="next" value={nextPath} />
            ) : null}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-bold text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full rounded-xl border-2 border-gray-100 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-primary"
                placeholder="ban@example.com"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-bold text-gray-700 mb-2"
              >
                Mật khẩu
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                minLength={6}
                required
                className="w-full rounded-xl border-2 border-gray-100 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-primary"
                placeholder="Ít nhất 6 ký tự"
              />
            </div>
            {state.error || authError ? (
              <p
                role="alert"
                className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              >
                {state.error ?? (authError && authErrorMessages[authError])}
              </p>
            ) : null}
            <SubmitButton />
          </form>

          <div className="mt-12 pt-8 border-t border-gray-100">
            <p className="text-xs text-center text-gray-400 font-medium leading-relaxed">
              Bằng việc đăng nhập, bạn đồng ý với <Link href="#" className="text-gray-900 hover:underline">Điều khoản dịch vụ</Link> và <Link href="#" className="text-gray-900 hover:underline">Chính sách bảo mật</Link> của chúng tôi.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT: Cover Image */}
      <div className="hidden lg:flex flex-1 relative bg-gray-900">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-80 mix-blend-overlay"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1541628951107-a55850900b9d?auto=format&fit=crop&w=2000&q=80")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-80" />
        
        <div className="relative z-10 flex flex-col justify-end p-20 w-full">
          <div className="max-w-xl">
            <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest rounded-full border border-white/20 mb-6">
              Khám Phá
            </span>
            <h2 className="text-5xl font-black text-white mb-6 leading-tight drop-shadow-xl tracking-tight">
              Bản đồ của riêng bạn. <br/>Kỷ niệm của cả nhóm.
            </h2>
            <p className="text-lg text-white/80 font-medium mb-10 max-w-md drop-shadow-md leading-relaxed">
              Tham gia cộng đồng hơn 100,000 backpackers. Clone lộ trình chỉ với 1 click và khởi hành ngay hôm nay.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                <img src="https://i.pravatar.cc/100?img=1" alt="User" className="w-10 h-10 rounded-full border-2 border-gray-900" />
                <img src="https://i.pravatar.cc/100?img=2" alt="User" className="w-10 h-10 rounded-full border-2 border-gray-900" />
                <img src="https://i.pravatar.cc/100?img=3" alt="User" className="w-10 h-10 rounded-full border-2 border-gray-900" />
                <div className="w-10 h-10 rounded-full border-2 border-gray-900 bg-white flex items-center justify-center text-xs font-bold text-gray-900">+1k</div>
              </div>
              <span className="text-sm font-bold text-white/80">Bạn bè đã tham gia</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
