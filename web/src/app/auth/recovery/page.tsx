"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { requestGateway } from "@/features/trip-planning/api/gateway-request";
import { z } from "zod";
import AuthStage from "@/features/auth/components/AuthStage";
import { Card } from "@/components/ui/card";

// Supabase delivers recovery tokens in the URL fragment. They are handed to the
// Gateway immediately, which verifies them and issues HttpOnly cookies.
export default function RecoveryPage() {
  const router = useRouter();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const expiresIn = Number(params.get("expires_in"));
    window.history.replaceState(null, "", window.location.pathname);
    if (!accessToken || !refreshToken || !Number.isFinite(expiresIn)) {
      queueMicrotask(() => setFailed(true));
      return;
    }
    requestGateway(
      {
        baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4100/api/v1",
        path: "api/v1/auth/session/import",
        method: "POST",
        body: { accessToken, refreshToken, expiresIn },
      },
      z.object({ authenticated: z.boolean() }),
    )
      .then(() => router.replace("/reset-password"))
      .catch(() => setFailed(true));
  }, [router]);

  return (
    <AuthStage backHref="/login" backLabel="Về đăng nhập">
      <Card className="relative z-10 w-full max-w-sm gap-4 p-8 shadow-lg">
        <h1 className="text-xl font-semibold">Đặt lại mật khẩu</h1>
        {failed ? (
          <p role="alert" className="text-sm text-muted-foreground">
            Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.{" "}
            <Link href="/forgot-password" className="font-medium text-foreground underline underline-offset-4">
              Yêu cầu liên kết mới
            </Link>
          </p>
        ) : (
          <p role="status" className="text-sm text-muted-foreground">Đang xác minh liên kết…</p>
        )}
      </Card>
    </AuthStage>
  );
}
