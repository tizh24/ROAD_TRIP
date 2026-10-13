"use client";

import React, { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { ArrowLeft, Compass, LoaderCircle, LogIn, ShieldCheck } from "lucide-react";
import { login, type LoginState } from "@/features/auth/actions";

const initialState: LoginState = { error: null };

const errorMessages = {
  callback: "Liên kết đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.",
  session_expired: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.",
} as const;

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="focus-ring mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-lg bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-card transition-all duration-200 hover:bg-primary-hover hover:shadow-card-hover active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <>
          <LoaderCircle size={18} className="animate-spin text-white" />
          <span>Đang xác thực…</span>
        </>
      ) : (
        <>
          <LogIn size={18} />
          <span>Đăng nhập</span>
        </>
      )}
    </button>
  );
}

interface LoginViewProps {
  authError?: "callback" | "session_expired";
  nextPath?: string;
}

export default function LoginView({ authError, nextPath }: LoginViewProps) {
  const [state, action] = useActionState(login, initialState);
  const activeError = state.error ?? (authError ? errorMessages[authError] : null);

  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[minmax(0,1.15fr)_minmax(28rem,40rem)]">
      {/* Left Editorial Visual Portal (Desktop) */}
      <section className="relative hidden overflow-hidden bg-secondary p-12 text-white lg:flex lg:flex-col lg:justify-between">
        {/* Cinematic Backdrop Image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 transition-transform duration-1000 ease-out hover:scale-105"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1541628951107-a55850900b9d?auto=format&fit=crop&w=2000&q=85')",
          }}
        />
        {/* Navy Atmosphere Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/75 to-secondary/40" />

        {/* Top Navigation */}
        <div className="relative z-10 flex items-center justify-between">
          <Link
            href="/"
            aria-label="Về trang chủ Road Trip Vietnam"
            className="focus-ring inline-flex items-center gap-2.5 rounded-lg border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md transition-all hover:bg-white/20 hover:border-white/30"
          >
            <ArrowLeft size={16} />
            <span>Về trang chủ</span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-white/70">
            <Compass size={16} className="text-accent" />
            <span>Atlas Đi Phượt</span>
          </div>
        </div>

        {/* Center Editorial Manifesto */}
        <div className="relative z-10 max-w-lg py-12">
          <h1 className="font-display text-5xl font-extrabold leading-[1.08] tracking-[-0.025em] text-white xl:text-6xl">
            Đi để thấy<br />nhiều hơn.
          </h1>
          <p className="mt-6 text-base font-normal leading-relaxed text-white/80 xl:text-lg">
            Đăng nhập để lưu hành trình đèo dốc, đồng bộ ghi chú offline và tiếp tục xây dựng chuyến đi cùng bạn đồng hành.
          </p>

          <div className="mt-10 flex items-center gap-6 border-t border-white/15 pt-6 text-xs text-white/70">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-primary" />
              <span>Dữ liệu lưu an toàn</span>
            </div>
            <span>•</span>
            <div>Bản đồ địa hình Việt Nam</div>
          </div>
        </div>

        {/* Bottom Coordinates Timestamp */}
        <div className="relative z-10 flex items-center justify-between text-xs font-medium text-white/50">
          <span>Hệ toạ độ VN-2000 / WGS-84</span>
          <span>Tripz Platform © 2026</span>
        </div>
      </section>

      {/* Right Interaction / Form Surface */}
      <section className="flex items-center justify-center px-4 py-10 sm:px-8 lg:px-14">
        <div className="w-full max-w-md">
          {/* Mobile Back Link */}
          <div className="mb-6 lg:hidden">
            <Link
              href="/"
              aria-label="Về trang chủ"
              className="focus-ring inline-flex items-center gap-2 rounded-lg text-sm font-bold text-text-sub transition-colors hover:text-text-main"
            >
              <ArrowLeft size={16} />
              <span>Về trang chủ</span>
            </Link>
          </div>

          {/* Form Card Surface */}
          <div className="rounded-card border border-border-main bg-surface p-7 shadow-card sm:p-9">
            {/* Header / Brand Mark */}
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white shadow-card">
                <Compass size={22} />
              </div>
              <div>
                <span className="font-display text-xl font-extrabold tracking-[-0.03em] text-secondary">Tripz</span>
                <p className="text-[11px] font-bold uppercase tracking-wider text-text-sub">Đăng nhập tài khoản</p>
              </div>
            </div>

            <h2 className="mt-6 font-display text-2xl font-extrabold tracking-[-0.02em] text-text-main sm:text-3xl">
              Chào mừng trở lại
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-text-sub">
              Nhập thông tin tài khoản để truy cập hành trình của bạn.
            </p>

            {/* Error Notification */}
            {activeError && (
              <div
                role="alert"
                aria-live="polite"
                className="mt-6 flex items-start gap-3 rounded-lg border border-danger/30 bg-danger/10 p-3.5 text-xs leading-relaxed font-semibold text-danger"
              >
                <span className="shrink-0 font-bold">⚠️</span>
                <div>{activeError}</div>
              </div>
            )}

            {/* Login Form */}
            <form action={action} className="mt-6 space-y-4">
              {nextPath && <input type="hidden" name="next" value={nextPath} />}

              <div>
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-text-main">
                  Email
                </label>
                <div className="mt-1.5">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="tenban@example.com"
                    className="focus-ring min-h-11 w-full rounded-lg border border-border-main bg-background-warm px-3.5 py-2.5 text-sm font-normal text-text-main placeholder:text-text-sub transition-colors focus:border-secondary focus:bg-surface"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-text-main">
                    Mật khẩu
                  </label>
                  <span className="text-[11px] font-medium text-text-sub">Tối thiểu 6 ký tự</span>
                </div>
                <div className="mt-1.5">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    minLength={6}
                    required
                    placeholder="••••••••"
                    className="focus-ring min-h-11 w-full rounded-lg border border-border-main bg-background-warm px-3.5 py-2.5 text-sm font-normal text-text-main placeholder:text-text-sub transition-colors focus:border-secondary focus:bg-surface"
                  />
                </div>
              </div>

              <SubmitButton />
            </form>

            {/* Auxiliary Links */}
            <div className="mt-6 border-t border-border-main/60 pt-5 text-center text-xs text-text-sub">
              <span>Chưa có kế hoạch? </span>
              <Link
                href="/explore"
                className="font-bold text-primary underline-offset-4 hover:underline"
              >
                Khám phá cung đường mẫu
              </Link>
            </div>
          </div>

          {/* Privacy Note */}
          <p className="mt-6 text-center text-[11px] leading-relaxed text-text-sub">
            Bằng việc đăng nhập, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của Tripz.
          </p>
        </div>
      </section>
    </main>
  );
}
