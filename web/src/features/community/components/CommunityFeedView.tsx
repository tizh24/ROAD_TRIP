"use client";

import Link from "next/link";
import TripCard from "@/components/ui/TripCard";
import { Compass, MapPin, Sparkles, TrendingUp } from "lucide-react";

const FEED_TRIPS = [
  { id: "1", title: "Khám phá Vịnh Hạ Long", image: "https://images.unsplash.com/photo-1627917865664-df818cb49b8f?auto=format&fit=crop&w=900&q=80", province: "Quảng Ninh", clones: 950, author: { name: "Trần Anh", avatar: "https://i.pravatar.cc/150?u=3" }, duration: "2 ngày", distance: "180 km", cost: "800k đ" },
  { id: "2", title: "Cung đường chữ S — Tây Bắc", image: "https://images.unsplash.com/photo-1596700543598-68e37cb0cc2c?auto=format&fit=crop&w=900&q=80", province: "Lai Châu", clones: 1250, author: { name: "Nguyễn Nam", avatar: "https://i.pravatar.cc/150?u=1" }, duration: "4 ngày", distance: "450 km", cost: "1.2M đ" },
] as const;

export default function CommunityFeedView() {
  return <main className="min-h-screen bg-background-warm py-10 pb-24 text-text-main sm:py-14">
    <div className="page-shell grid gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
      <section>
        <header className="relative overflow-hidden rounded-[2rem] bg-secondary p-7 text-white shadow-card sm:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(239,177,91,.3),transparent_26%),radial-gradient(circle_at_60%_100%,rgba(217,101,50,.35),transparent_30%)]" />
          <div className="relative max-w-2xl"><p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold"><Sparkles size={14} /> Cảm hứng từ cộng đồng</p><h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-5xl">Những cung đường đáng nhớ</h1><p className="mt-4 max-w-xl text-sm leading-6 text-white/75 sm:text-base">Khám phá các lộ trình công khai để lấy cảm hứng cho chuyến đi tiếp theo của bạn.</p><Link href="/explore" className="focus-ring mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white shadow-card hover:bg-primary-hover"><Compass size={16} /> Khám phá lộ trình</Link></div>
        </header>

        <div className="mt-8 flex gap-2 overflow-x-auto pb-2" aria-label="Bộ lọc cộng đồng"><span className="shrink-0 rounded-full bg-secondary px-4 py-2 text-xs font-bold text-white">Đề xuất</span><span className="shrink-0 rounded-full border border-border-main bg-surface px-4 py-2 text-xs font-bold text-text-sub"><TrendingUp size={13} className="mr-1 inline" />Phổ biến</span><span className="shrink-0 rounded-full border border-border-main bg-surface px-4 py-2 text-xs font-bold text-text-sub"><MapPin size={13} className="mr-1 inline" />Theo điểm đến</span></div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">{FEED_TRIPS.map((trip) => <TripCard key={trip.id} trip={trip} />)}</div>
        <p className="mt-8 rounded-2xl border border-dashed border-border-main bg-surface p-5 text-center text-sm text-text-sub">Bảng tin hiện hiển thị các lộ trình công khai được chọn lọc. Bình luận, báo cáo và lưu bài sẽ xuất hiện khi tính năng được hỗ trợ.</p>
      </section>

      <aside className="space-y-6 lg:sticky lg:top-6 lg:h-fit"><section className="surface-card p-6"><p className="text-xs font-extrabold uppercase tracking-[.14em] text-primary">Điểm đến nổi bật</p><h2 className="mt-2 text-xl font-extrabold">Đang được khám phá</h2><ol className="mt-5 space-y-4">{[{ name: "Hà Giang", count: "1.245 lộ trình" }, { name: "Lâm Đồng", count: "850 lộ trình" }, { name: "Cao Bằng", count: "620 lộ trình" }].map((location, index) => <li key={location.name} className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-extrabold text-primary">0{index + 1}</span><div><strong className="block text-sm">{location.name}</strong><span className="text-xs text-text-sub">{location.count}</span></div></li>)}</ol></section><section className="surface-card border-primary/20 bg-primary/5 p-6"><h2 className="font-extrabold">Có một hành trình hay?</h2><p className="mt-2 text-sm leading-6 text-text-sub">Tạo chuyến đi của bạn để bắt đầu lập kế hoạch cùng nhóm.</p><Link href="/trips/new" className="focus-ring mt-4 inline-flex text-sm font-bold text-primary underline">Tạo chuyến đi</Link></section></aside>
    </div>
  </main>;
}
