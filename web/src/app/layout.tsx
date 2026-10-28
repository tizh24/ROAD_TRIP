import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LoginAnalyticsMarker from "@/lib/analytics/LoginAnalyticsMarker";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter-loaded",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Tripz - Lên lịch cả chuyến đi trên một tấm bản đồ", template: "%s · Tripz" },
  description: "Lên kế hoạch, bám sát lộ trình, lưu giữ kỷ niệm và quyết toán chi phí cho các chuyến đi phượt.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="vi"
      className={`h-full antialiased ${inter.variable}`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <LoginAnalyticsMarker />
        <div className="w-full flex-1 flex flex-col min-h-screen relative overflow-x-hidden">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
