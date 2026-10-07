import type { Metadata } from "next";
import "./globals.css";
import LoginAnalyticsMarker from "@/lib/analytics/LoginAnalyticsMarker";

export const metadata: Metadata = {
  title: "Road Trip Planner - Bản Đồ Phượt Việt Nam",
  description: "Lên kế hoạch, bám sát lộ trình, lưu giữ kỷ niệm và quyết toán chi phí cho các chuyến đi phượt.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="vi"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-background text-text-main">
        <LoginAnalyticsMarker />
        <div className="w-full flex-1 flex flex-col min-h-screen relative overflow-x-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
