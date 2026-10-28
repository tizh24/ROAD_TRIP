"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { updateProfileName } from "@/features/auth/actions";
import { initialAuthFormState } from "@/features/auth/form-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="min-h-11">
      {pending ? (
        <>
          <LoaderCircle className="animate-spin" aria-hidden="true" />
          Đang lưu…
        </>
      ) : (
        "Lưu tên hiển thị"
      )}
    </Button>
  );
}

export default function ProfileSettingsForm({ fullName, email }: { fullName: string; email: string }) {
  const [state, action] = useActionState(updateProfileName, initialAuthFormState);
  return (
    <div className="mt-10 space-y-12">
      <section aria-labelledby="profile-info">
        <h2 id="profile-info" className="text-xl font-medium">Thông tin hồ sơ</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Tên hiển thị được dùng trên các hành trình và lời mời của bạn.</p>
        <form action={action} className="mt-6 max-w-lg space-y-5">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium">Tên hiển thị</label>
            <Input id="fullName" name="fullName" defaultValue={fullName} minLength={2} maxLength={80} required autoComplete="name" className="mt-2 h-11" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium">Email</label>
            <Input id="email" value={email} readOnly aria-readonly="true" className="mt-2 h-11 cursor-not-allowed bg-muted text-muted-foreground" />
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Email được quản lý bởi nhà cung cấp đăng nhập và chưa thể thay đổi tại đây.</p>
          </div>
          <SaveButton />
          {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
          {state.message && (
            <p role="status" className="flex items-center gap-2 text-sm text-success">
              <CheckCircle2 className="size-4" aria-hidden="true" />
              {state.message}
            </p>
          )}
        </form>
      </section>

      <section aria-labelledby="profile-password" className="rounded-xl bg-muted p-5 sm:p-6">
        <h2 id="profile-password" className="text-xl font-medium">Mật khẩu</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Đặt lại mật khẩu qua email để giữ tài khoản an toàn.</p>
        <Link href="/forgot-password" className="focus-ring mt-3 inline-flex min-h-11 items-center text-sm font-medium underline underline-offset-4">Đặt lại mật khẩu</Link>
      </section>
    </div>
  );
}
