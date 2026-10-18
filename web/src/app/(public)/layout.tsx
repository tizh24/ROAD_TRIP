import React from "react";
import Navbar from "@/components/ui/Navbar";
import { gatewayCurrentSession } from "@/lib/api/gateway-server";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await gatewayCurrentSession();

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
