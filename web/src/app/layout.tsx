import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Road Trip Planner - Bản Đồ Phượt Việt Nam",
  description: "Lên kế hoạch, bám sát lộ trình, lưu giữ kỷ niệm và quyết toán chi phí cho các chuyến đi phượt.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="vi"
      className={`${plusJakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-text-main">
        <div className="w-full flex-1 flex flex-col min-h-screen relative overflow-x-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
