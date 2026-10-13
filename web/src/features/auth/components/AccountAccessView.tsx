"use client";

import Link from "next/link";
import { useActionState, type ComponentProps } from "react";
import { useFormStatus } from "react-dom";
import { ArrowLeft, CheckCircle2, KeyRound, LoaderCircle, UserPlus } from "lucide-react";
import {
  initialAuthFormState,
  requestPasswordReset,
  signUp,
  updatePassword,
  type AuthFormState,
} from "@/features/auth/actions";

type AccessMode = "signup" | "forgot-password" | "reset-password";

const content = {
  signup: {
    icon: UserPlus,
    title: "Bắt đầu hành trình của bạn",
    description: "Tạo tài khoản để lưu cung đường, tiếp tục kế hoạch và cùng đi với bạn đồng hành.",
    submit: "Tạo tài khoản",
  },
  "forgot-password": {
    icon: KeyRound,
    title: "Lấy lại quyền truy cập",
    description: "Nhập email đã dùng với Tripz. Chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu nếu tài khoản tồn tại.",
    submit: "Gửi hướng dẫn",
  },
  "reset-password": {
    icon: KeyRound,
    title: "Đặt mật khẩu mới",
    description: "Chọn mật khẩu mới có ít nhất 8 ký tự để tiếp tục bảo vệ hành trình của bạn.",
    submit: "Cập nhật mật khẩu",
  },
} as const;

function SubmitButton({ label }: { label: string }) {
  return <button type="submit" className="focus-ring mt-2 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white shadow-card transition-all duration-200 hover:bg-primary-hover hover:shadow-card-hover active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60">
    <PendingLabel label={label} />
  </button>;
}

function PendingLabel({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return pending ? <><LoaderCircle size={17} className="animate-spin" />Đang xử lý…</> : <>{label}</>;
}

function Feedback({ state }: { state: AuthFormState }) {
  if (state.error) return <p role="alert" aria-live="polite" className="mt-5 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm leading-6 text-danger">{state.error}</p>;
  if (state.message) return <p role="status" aria-live="polite" className="mt-5 flex gap-2 rounded-lg bg-success/10 p-3 text-sm leading-6 text-success"><CheckCircle2 className="mt-0.5 shrink-0" size={18} />{state.message}</p>;
  return null;
}

function Input({ id, label, ...props }: ComponentProps<"input"> & { id: string; label: string }) {
  return <div>
    <label htmlFor={id} className="block text-xs font-bold uppercase tracking-wider text-text-main">{label}</label>
    <input id={id} className="focus-ring mt-1.5 min-h-11 w-full rounded-lg border border-border-main bg-background-warm px-3.5 py-2.5 text-sm text-text-main placeholder:text-text-sub transition-colors focus:border-secondary focus:bg-surface" {...props} />
  </div>;
}

function SignUpForm({ nextPath }: { nextPath?: string }) {
  const [state, action] = useActionState(signUp, initialAuthFormState);
  return <form action={action} className="mt-7 space-y-4">
    {nextPath && <input type="hidden" name="next" value={nextPath} />}
    <Input id="fullName" name="fullName" label="Tên hiển thị" autoComplete="name" minLength={2} maxLength={80} required placeholder="Tên bạn muốn hiển thị" />
    <Input id="email" name="email" label="Email" type="email" autoComplete="email" required placeholder="tenban@example.com" />
    <Input id="password" name="password" label="Mật khẩu" type="password" autoComplete="new-password" minLength={8} required placeholder="Ít nhất 8 ký tự" />
    <Input id="passwordConfirmation" name="passwordConfirmation" label="Xác nhận mật khẩu" type="password" autoComplete="new-password" minLength={8} required placeholder="Nhập lại mật khẩu" />
    <SubmitButton label={content.signup.submit} />
    <Feedback state={state} />
  </form>;
}

function ForgotPasswordForm() {
  const [state, action] = useActionState(requestPasswordReset, initialAuthFormState);
  return <form action={action} className="mt-7 space-y-4">
    <Input id="email" name="email" label="Email" type="email" autoComplete="email" required placeholder="tenban@example.com" />
    <SubmitButton label={content["forgot-password"].submit} />
    <Feedback state={state} />
  </form>;
}

function ResetPasswordForm() {
  const [state, action] = useActionState(updatePassword, initialAuthFormState);
  return <form action={action} className="mt-7 space-y-4">
    <Input id="password" name="password" label="Mật khẩu mới" type="password" autoComplete="new-password" minLength={8} required placeholder="Ít nhất 8 ký tự" />
    <Input id="passwordConfirmation" name="passwordConfirmation" label="Xác nhận mật khẩu mới" type="password" autoComplete="new-password" minLength={8} required placeholder="Nhập lại mật khẩu" />
    <SubmitButton label={content["reset-password"].submit} />
    <Feedback state={state} />
  </form>;
}

export default function AccountAccessView({ mode, nextPath }: { mode: AccessMode; nextPath?: string }) {
  const { icon: Icon, title, description } = content[mode];
  const form = mode === "signup" ? <SignUpForm nextPath={nextPath} /> : mode === "forgot-password" ? <ForgotPasswordForm /> : <ResetPasswordForm />;

  return <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 sm:px-6">
    <div className="w-full max-w-md">
      <Link href={mode === "reset-password" ? "/login" : "/"} className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-bold text-text-sub transition-colors hover:text-text-main"><ArrowLeft size={16} />{mode === "reset-password" ? "Về đăng nhập" : "Về trang chủ"}</Link>
      <section className="mt-6 rounded-card border border-border-main bg-surface p-6 shadow-card sm:p-8">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white shadow-card"><Icon size={20} /></span>
        <p className="mt-5 font-display text-xl font-extrabold tracking-[-0.03em] text-secondary">Tripz</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-[-0.03em] text-text-main">{title}</h1>
        <p className="mt-3 max-w-[38ch] text-sm leading-6 text-text-sub">{description}</p>
        {form}
        {mode === "signup" && <p className="mt-6 border-t border-border-main pt-5 text-center text-sm text-text-sub">Đã có tài khoản? <Link href={nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login"} className="focus-ring font-bold text-primary underline-offset-4 hover:underline">Đăng nhập</Link></p>}
        {mode === "forgot-password" && <p className="mt-6 border-t border-border-main pt-5 text-center text-sm text-text-sub"><Link href="/login" className="focus-ring font-bold text-primary underline-offset-4 hover:underline">Quay lại đăng nhập</Link></p>}
        {mode === "reset-password" && <p className="mt-6 border-t border-border-main pt-5 text-center text-sm text-text-sub">Không còn hiệu lực? <Link href="/forgot-password" className="focus-ring font-bold text-primary underline-offset-4 hover:underline">Yêu cầu liên kết mới</Link></p>}
      </section>
    </div>
  </main>;
}
