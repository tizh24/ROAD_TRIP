import React from "react";
import AppShell from "@/components/shell/AppShell";
import { requireCapability } from "@/lib/auth/authorization";

export default async function PartnerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireCapability("partner.access", "/partner");

  return (
    <AppShell variant="partner" user={user}>
      {children}
    </AppShell>
  );
}
