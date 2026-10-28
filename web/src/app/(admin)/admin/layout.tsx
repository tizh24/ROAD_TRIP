import React from "react";
import AppShell from "@/components/shell/AppShell";
import { requireCapability } from "@/lib/auth/authorization";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireCapability("admin.access", "/admin");

  return (
    <AppShell variant="admin" user={user}>
      {children}
    </AppShell>
  );
}
