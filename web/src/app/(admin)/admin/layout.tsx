import React from "react";
import AdminSidebar from "@/features/admin/components/layout/AdminSidebar";
import AdminHeader from "@/features/admin/components/layout/AdminHeader";
import { requireRole } from "@/lib/auth/authorization";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole("ADMIN", "/admin");

  return (
    <div className="flex h-screen bg-background text-text-main font-sans overflow-hidden antialiased">
      <AdminSidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
        <AdminHeader />
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          {children}
        </div>
      </main>
    </div>
  );
}
