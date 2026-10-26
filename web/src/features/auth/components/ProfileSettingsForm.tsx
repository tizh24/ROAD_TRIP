"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { updateProfileName } from "@/features/auth/actions";
import { initialAuthFormState } from "@/features/auth/form-state";

function SaveButton() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary-strong px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-strong/90 disabled:cursor-not-allowed disabled:opacity-60">{pending ? <><LoaderCircle size={16} className="animate-spin" />Đang lưu…</> : "Lưu tên hiển thị"}</button>;
}

export default function ProfileSettingsForm({ fullName, email }: { fullName: string; email: string }) {
  const [state, action] = useActionState(updateProfileName, initialAuthFormState);
  return <section className="surface-card mt-8 overflow-hidden">
    <div className="border-b border-border-main p-5 sm:p-6"><h2 className="text-xl font-extrabold">Thông tin hồ sơ</h2><p className="mt-1 text-sm leading-6 text-text-sub">Tên hiển thị được dùng trên các hành trình và lời mời của bạn.</p></div>
    <form action={action} className="space-y-5 p-5 sm:p-6">
      <div><label htmlFor="fullName" className="block text-sm font-bold text-text-main">Tên hiển thị</label><input id="fullName" name="fullName" defaultValue={fullName} minLength={2} maxLength={80} required autoComplete="name" className="focus-ring mt-2 min-h-11 w-full rounded-lg border border-border-main bg-background-warm px-3 text-sm text-text-main focus:border-secondary focus:bg-surface" /></div>
      <div><label htmlFor="email" className="block text-sm font-bold text-text-main">Email</label><input id="email" value={email} readOnly aria-readonly="true" className="mt-2 min-h-11 w-full cursor-not-allowed rounded-lg border border-border-main bg-background-warm px-3 text-sm text-text-sub" /><p className="mt-2 text-xs leading-5 text-text-sub">Email được quản lý bởi nhà cung cấp đăng nhập và chưa thể thay đổi tại đây.</p></div>
      <SaveButton />
      {state.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
      {state.message && <p role="status" className="flex items-center gap-2 text-sm text-success"><CheckCircle2 size={17} />{state.message}</p>}
    </form>
    <div className="border-t border-border-main bg-background-warm px-5 py-5 sm:px-6"><h2 className="font-extrabold">Mật khẩu</h2><p className="mt-1 text-sm leading-6 text-text-sub">Đặt lại mật khẩu qua email để giữ tài khoản an toàn.</p><Link href="/forgot-password" className="focus-ring mt-3 inline-flex min-h-11 items-center text-sm font-bold text-primary hover:underline">Đặt lại mật khẩu</Link></div>
  </section>;
}
