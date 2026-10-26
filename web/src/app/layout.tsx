import type { Metadata } from "next";
import { Be_Vietnam_Pro, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import LoginAnalyticsMarker from "@/lib/analytics/LoginAnalyticsMarker";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-be-vietnam-pro-loaded",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter-loaded",
  display: "swap",
});
const playfair = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  style: ["normal", "italic"],
  variable: "--font-playfair-loaded",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Road Trip Planner - Bản Đồ Phượt Việt Nam",
  description: "Lên kế hoạch, bám sát lộ trình, lưu giữ kỷ niệm và quyết toán chi phí cho các chuyến đi phượt.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="vi"
      className={`h-full antialiased ${beVietnamPro.variable} ${inter.variable} ${playfair.variable}`}
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
