"use client";

import Link from "next/link";
import { useActionState, type ComponentProps } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import {
  requestPasswordReset,
  signUp,
  updatePassword,
} from "@/features/auth/actions";
import {
  initialAuthFormState,
  type AuthFormState,
} from "@/features/auth/form-state";
import AuthStage from "@/features/auth/components/AuthStage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AccessMode = "signup" | "forgot-password" | "reset-password";

const content = {
  signup: {
    title: "Bắt đầu hành trình của bạn",
    description: "Tạo tài khoản để lưu cung đường, tiếp tục kế hoạch và cùng đi với bạn đồng hành.",
    submit: "Tạo tài khoản",
  },
  "forgot-password": {
    title: "Lấy lại quyền truy cập",
    description: "Nhập email đã dùng với Tripz. Chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu nếu tài khoản tồn tại.",
    submit: "Gửi hướng dẫn",
  },
  "reset-password": {
    title: "Đặt mật khẩu mới",
    description: "Chọn mật khẩu mới có ít nhất 8 ký tự để tiếp tục bảo vệ hành trình của bạn.",
    submit: "Cập nhật mật khẩu",
  },
} as const;

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="h-11 w-full">
      {pending ? (
        <>
          <LoaderCircle className="animate-spin" aria-hidden="true" />
          Đang xử lý…
        </>
      ) : (
        label
      )}
    </Button>
  );
}

function Feedback({ state }: { state: AuthFormState }) {
  if (state.error) {
    return (
      <p role="alert" aria-live="polite" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm font-medium text-destructive">
        {state.error}
      </p>
    );
  }
  if (state.message) {
    return (
      <p role="status" aria-live="polite" className="flex gap-2 rounded-lg border border-border bg-muted p-3 text-sm text-foreground">
        <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        {state.message}
      </p>
    );
  }
  return null;
}

function Field({ id, label, ...props }: ComponentProps<"input"> & { id: string; label: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} className="h-11" {...props} />
    </div>
  );
}

function SignUpForm({ nextPath }: { nextPath?: string }) {
  const [state, action] = useActionState(signUp, initialAuthFormState);
  return (
    <form action={action} className="space-y-4">
      {nextPath && <input type="hidden" name="next" value={nextPath} />}
      <Field id="fullName" name="fullName" label="Tên hiển thị" autoComplete="name" minLength={2} maxLength={80} required placeholder="Tên bạn muốn hiển thị" />
      <Field id="email" name="email" label="Email" type="email" autoComplete="email" spellCheck={false} required placeholder="tenban@example.com" />
      <Field id="password" name="password" label="Mật khẩu" type="password" autoComplete="new-password" minLength={8} required placeholder="Ít nhất 8 ký tự" />
      <Field id="passwordConfirmation" name="passwordConfirmation" label="Xác nhận mật khẩu" type="password" autoComplete="new-password" minLength={8} required placeholder="Nhập lại mật khẩu" />
      <SubmitButton label={content.signup.submit} />
      <Feedback state={state} />
    </form>
  );
}

function ForgotPasswordForm() {
  const [state, action] = useActionState(requestPasswordReset, initialAuthFormState);
  return (
    <form action={action} className="space-y-4">
      <Field id="email" name="email" label="Email" type="email" autoComplete="email" spellCheck={false} required placeholder="tenban@example.com" />
      <SubmitButton label={content["forgot-password"].submit} />
      <Feedback state={state} />
    </form>
  );
}

function ResetPasswordForm() {
  const [state, action] = useActionState(updatePassword, initialAuthFormState);
  return (
    <form action={action} className="space-y-4">
      <Field id="password" name="password" label="Mật khẩu mới" type="password" autoComplete="new-password" minLength={8} required placeholder="Ít nhất 8 ký tự" />
      <Field id="passwordConfirmation" name="passwordConfirmation" label="Xác nhận mật khẩu mới" type="password" autoComplete="new-password" minLength={8} required placeholder="Nhập lại mật khẩu" />
      <SubmitButton label={content["reset-password"].submit} />
      <Feedback state={state} />
    </form>
  );
}

const footerLink = "font-medium text-foreground underline-offset-4 hover:underline";

export default function AccountAccessView({ mode, nextPath }: { mode: AccessMode; nextPath?: string }) {
  const { title, description } = content[mode];
  const form = mode === "signup" ? <SignUpForm nextPath={nextPath} /> : mode === "forgot-password" ? <ForgotPasswordForm /> : <ResetPasswordForm />;

  return (
    <AuthStage
      backHref={mode === "reset-password" ? "/login" : "/"}
      backLabel={mode === "reset-password" ? "Về đăng nhập" : "Về trang chủ"}
    >
      <Card className="relative z-10 w-full max-w-sm gap-6 p-8 shadow-lg">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {form}
        {mode === "signup" && (
          <p className="text-center text-sm text-muted-foreground">
            Đã có tài khoản?{" "}
            <Link href={nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login"} className={footerLink}>Đăng nhập</Link>
          </p>
        )}
        {mode === "forgot-password" && (
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/login" className={footerLink}>Quay lại đăng nhập</Link>
          </p>
        )}
        {mode === "reset-password" && (
          <p className="text-center text-sm text-muted-foreground">
            Không còn hiệu lực?{" "}
            <Link href="/forgot-password" className={footerLink}>Yêu cầu liên kết mới</Link>
          </p>
        )}
      </Card>
    </AuthStage>
  );
}
