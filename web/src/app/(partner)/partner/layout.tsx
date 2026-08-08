import React from "react";
import PartnerSidebar from "@/features/monetization/components/partner/layout/PartnerSidebar";
import PartnerHeader from "@/features/monetization/components/partner/layout/PartnerHeader";

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden antialiased">
      <PartnerSidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FAFAFA]">
        <PartnerHeader />
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          {children}
        </div>
      </main>
    </div>
  );
}
