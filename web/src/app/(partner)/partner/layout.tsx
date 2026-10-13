import React from "react";
import PartnerSidebar from "@/features/monetization/components/partner/layout/PartnerSidebar";
import PartnerHeader from "@/features/monetization/components/partner/layout/PartnerHeader";
import { requireRole } from "@/lib/auth/authorization";

export default async function PartnerLayout({ children }: { children: React.ReactNode }) {
  await requireRole("PARTNER", "/partner");

  return (
    <div className="flex h-screen bg-background text-text-main font-sans overflow-hidden antialiased">
      <PartnerSidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
        <PartnerHeader />
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          {children}
        </div>
      </main>
    </div>
  );
}
