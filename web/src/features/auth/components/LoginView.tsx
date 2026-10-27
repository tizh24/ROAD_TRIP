"use client";

import React, { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { login, type LoginState } from "@/features/auth/actions";
import { oauthProviders, startOAuth, type OAuthProvider } from "@/features/auth/oauth-providers";
import AuthStage from "@/features/auth/components/AuthStage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: LoginState = { error: null };

const errorMessages = {
  callback: "Liên kết đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.",
  session_expired: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.",
  auth_unavailable: "Không thể xác minh tài khoản lúc này. Vui lòng kiểm tra cấu hình máy chủ rồi thử lại.",
} as const;

function GoogleIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
        fill="#1877F2"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
        fill="currentColor"
      />
    </svg>
  );
}

const providerIcons: Record<OAuthProvider, () => React.JSX.Element> = {
  google: GoogleIcon,
  facebook: FacebookIcon,
  apple: AppleIcon,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="h-11 w-full">
      {pending ? (
        <>
          <LoaderCircle className="animate-spin" aria-hidden="true" />
          <span>Đang xác thực…</span>
        </>
      ) : (
        "Đăng nhập bằng email"
      )}
    </Button>
  );
}

interface LoginViewProps {
  authError?: "callback" | "session_expired" | "auth_unavailable";
  nextPath?: string;
}

export default function LoginView({ authError, nextPath }: LoginViewProps) {
  const [state, action] = useActionState(login, initialState);
  const activeError = state.error ?? (authError ? errorMessages[authError] : null);

  return (
    <AuthStage>
      <Card className="relative z-10 w-full max-w-sm gap-6 p-8 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Chào mừng trở lại</h1>
          <p className="text-sm text-muted-foreground">Chọn cách đăng nhập để truy cập hành trình của bạn</p>
        </div>

        {activeError && (
          <div
            role="alert"
            aria-live="polite"
            className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm font-medium text-destructive"
          >
            {activeError}
          </div>
        )}

        {/* Social sign-in: provider flows are not wired yet, see oauth-providers.ts */}
        <div className="space-y-3">
          {oauthProviders.map(({ id, label }) => {
            const Icon = providerIcons[id];
            return (
              <Button
                key={id}
                type="button"
                variant="outline"
                className="h-11 w-full justify-start gap-3"
                onClick={() => startOAuth(id)}
              >
                <Icon />
                Tiếp tục với {label}
              </Button>
            );
          })}
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Hoặc dùng email</span>
          </div>
        </div>

        <form action={action} className="space-y-4">
          {nextPath && <input type="hidden" name="next" value={nextPath} />}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              spellCheck={false}
              required
              placeholder="tenban@example.com"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Mật khẩu</Label>
              <Link href="/forgot-password" className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                Quên mật khẩu?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              minLength={8}
              required
              placeholder="Nhập mật khẩu"
              className="h-11"
            />
          </div>

          <SubmitButton />
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Chưa có tài khoản?{" "}
          <Link
            href={nextPath ? `/signup?next=${encodeURIComponent(nextPath)}` : "/signup"}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Tạo tài khoản
          </Link>
        </p>
      </Card>
    </AuthStage>
  );
}
