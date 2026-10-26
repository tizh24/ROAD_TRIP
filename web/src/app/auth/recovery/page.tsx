"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { requestGateway } from "@/features/trip-planning/api/gateway-request";
import { z } from "zod";

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
    <main className="flex min-h-screen items-center justify-center px-4">
      {failed ? (
        <p role="alert" className="text-center text-sm">
          Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.{" "}
          <Link href="/forgot-password" className="font-bold text-primary underline">
            Yêu cầu liên kết mới
          </Link>
        </p>
      ) : (
        <p role="status" className="text-sm">Đang xác minh liên kết…</p>
      )}
    </main>
  );
}
