"use client";

import React from "react";
import Navbar from "@/components/ui/Navbar";
import { usePathname } from "next/navigation";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMarketingHome = pathname === "/";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {!isMarketingHome ? <Navbar /> : null}
      <main id="main-content" tabIndex={-1} className="flex flex-1 flex-col">
        {children}
      </main>
    </div>
  );
}
