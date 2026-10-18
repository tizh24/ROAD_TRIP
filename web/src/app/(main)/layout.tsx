import React from "react";
import Navbar from "@/components/ui/Navbar";
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
    <div className="flex min-h-screen flex-col bg-background">
      <a href="#main-content" className="skip-link">Bỏ qua đến nội dung chính</a>
      <Navbar user={session.data} />
      <main id="main-content" tabIndex={-1} className="flex flex-1 flex-col">
        {children}
      </main>
    </div>
  );
}
