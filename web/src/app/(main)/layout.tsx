import React from "react";
import Navbar from "@/components/ui/Navbar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <a href="#main-content" className="skip-link">Bỏ qua đến nội dung chính</a>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
