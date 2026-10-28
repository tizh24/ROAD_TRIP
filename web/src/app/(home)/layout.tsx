import React from "react";
import LandingTopBar from "@/features/community/components/landing/LandingTopBar";
import LandingFooter from "@/features/community/components/landing/LandingFooter";
import { gatewayCurrentSession } from "@/lib/api/gateway-server";

// The home route owns its page; other public routes keep the shared Navbar from the (public) layout.
export default async function HomeLayout({ children }: { children: React.ReactNode }) {
  const session = await gatewayCurrentSession();

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <a href="#main-content" className="skip-link">Bỏ qua đến nội dung chính</a>
      <LandingTopBar signedIn={Boolean(session.data)} />
      <main id="main-content" tabIndex={-1} className="flex flex-1 flex-col">
        {children}
      </main>
      <LandingFooter />
    </div>
  );
}
