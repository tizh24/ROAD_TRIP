import React from "react";
import AdminSidebar from "@/features/admin/components/layout/AdminSidebar";
import AdminHeader from "@/features/admin/components/layout/AdminHeader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background text-text-main font-sans overflow-hidden antialiased">
      <AdminSidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FAFAFA]">
        <AdminHeader />
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          {children}
        </div>
      </main>
    </div>
  );
}
