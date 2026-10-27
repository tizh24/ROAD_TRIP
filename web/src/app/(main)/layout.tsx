import React from "react";
import AppShell from "@/components/shell/AppShell";
import { gatewayCurrentSession } from "@/lib/api/gateway-server";
import { hasGatewayAuthCookie } from "@/lib/auth/route-protection";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  if (!hasGatewayAuthCookie(cookieStore.getAll())) {
    redirect("/login");
  }

  const session = await gatewayCurrentSession();
  if (!session.data) {
    redirect(
      session.error?.code === "AUTH_UNAVAILABLE"
        ? "/login?authError=auth_unavailable"
        : "/login?authError=session_expired",
    );
  }

  return (
    <AppShell variant="traveler" user={session.data}>
      {children}
    </AppShell>
  );
}
