"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Compass,
  Sparkles,
  MapPin,
  Wallet,
  Calendar,
  ArrowRight,
  Quote,
} from "lucide-react";
import type { PublicTrip } from "@/features/trip-planning/api/public-trips";

function InstagramIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function YoutubeIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <polygon points="10 15 15 12 10 9 10 15" fill="currentColor" />
    </svg>
  );
}

export default function LandingPage({
  liveTrips = [],
}: {
  liveTrips?: readonly PublicTrip[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"classic" | "custom">("classic");
  const [destination, setDestination] = useState("");
  const [budget, setBudget] = useState("Cân bằng (5 - 15 triệu)");
  const [duration, setDuration] = useState("Vừa đủ (3 Ngày 2 Đêm)");
  const [newsletterNotice, setNewsletterNotice] = useState("");

  const handlePlannerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "custom") {
      const params = new URLSearchParams();
      if (destination.trim()) params.set("title", destination.trim());
      router.push(`/planner/new?${params.toString()}`);
      return;
    }
    const params = new URLSearchParams();
    if (destination.trim()) params.set("q", destination.trim());
    router.push(`/explore?${params.toString()}`);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterNotice("Đăng ký thành công! Tripz sẽ gửi những hành trình tuyển chọn sớm nhất tới bạn.");
  };

  return (
    <div className="bg-brand-offwhite bg-grain relative antialiased selection:bg-brand-orange selection:text-white min-h-screen text-brand-charcoal">
      {/* 2. Hero Section */}
      <section className="relative pt-4 sm:pt-6 md:pt-8 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl 2xl:max-w-[1360px] mx-auto">
        {/* Hero Background Immersive Card */}
        <div className="relative w-full h-[60vh] sm:h-[64vh] lg:h-[68vh] min-h-[460px] max-h-[600px] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl group">
          {/* Background Image */}
          <Image
            src="https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2000&auto=format&fit=crop"
            alt="Mù Căng Chải - Việt Nam"
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="absolute inset-0 w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000 ease-out group-hover:scale-100"
          />

          {/* Dark Gradient Overlays for Editorial Depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

          {/* Hero Content */}
          <div className="absolute inset-0 p-6 sm:p-8 md:p-12 lg:p-14 flex flex-col justify-between text-white z-10">
            {/* Top Badge */}
            <div className="flex justify-between items-start">
              <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-xs font-mono tracking-widest uppercase px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
                Ấn phẩm Du Lịch Độc Bản
              </span>
              <span className="hidden sm:block text-xs font-mono tracking-wider opacity-80">
                VIETNAM EDITION / 2026
              </span>
            </div>

            {/* Main Tagline & Subtitle */}
            <div className="max-w-3xl mb-4 sm:mb-6 md:mb-8">
              <p className="text-brand-orange text-sm md:text-base font-semibold tracking-widest uppercase mb-2 sm:mb-3">
                Tự do & Phiêu lưu
              </p>
              <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-light leading-[1.1] tracking-tight mb-3 sm:mb-4">
                KHÁM PHÁ VIỆT NAM.
                <br />
                <span className="italic font-normal">TỰ DO. PHIÊU LƯU.</span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-white/80 max-w-xl font-light leading-relaxed">
                Nền tảng lên kế hoạch du lịch thông minh, mang đến hành trình được may đo tỉ mỉ dành riêng cho tâm hồn phóng khoáng.
              </p>
            </div>
          </div>
        </div>

        {/* Floating Quick Plan Search Widget */}
        <div id="hero-planner" className="relative -mt-14 sm:-mt-16 lg:-mt-20 z-20 max-w-4xl mx-auto w-full px-2 sm:px-4">
          <div className="bg-white/95 backdrop-blur-xl border border-brand-border shadow-2xl rounded-2xl p-4 sm:p-6 transition-all duration-300">
            {/* Tabs */}
            <div className="flex items-center gap-6 border-b border-brand-border/60 pb-3 mb-5 text-xs sm:text-sm">
              <button
                id="tab-classic"
                type="button"
                onClick={() => setActiveTab("classic")}
                className={`tab-btn pb-3 -mb-3 transition-colors flex items-center gap-2 ${
                  activeTab === "classic"
                    ? "active text-brand-orange font-semibold border-b-2 border-brand-orange"
                    : "text-brand-muted font-medium hover:text-brand-charcoal"
                }`}
              >
                <Compass className="w-4 h-4" /> Tạo Lịch Trình Nhanh
              </button>
              <button
                id="tab-custom"
                type="button"
                onClick={() => setActiveTab("custom")}
                className={`tab-btn pb-3 -mb-3 transition-colors flex items-center gap-2 ${
                  activeTab === "custom"
                    ? "active text-brand-orange font-semibold border-b-2 border-brand-orange"
                    : "text-brand-muted font-medium hover:text-brand-charcoal"
                }`}
              >
                <Sparkles className="w-4 h-4" /> AI May Đo Độc Bản
              </button>
            </div>

            {/* Tab Content: Quick Planner */}
            <form onSubmit={handlePlannerSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
              {/* Field 1: Destination */}
              <div className="p-3 bg-brand-offwhite rounded-xl border border-brand-border/50 focus-within:border-brand-orange transition-colors">
                <label className="block text-[10px] font-semibold text-brand-muted uppercase tracking-wider mb-1">
                  Bạn muốn đi đâu?
                </label>
                <div className="flex items-center gap-2">
                  <MapPin className="text-brand-orange w-4 h-4 shrink-0" />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="VD: Hà Giang, Phú Quốc..."
                    className="w-full bg-transparent text-sm font-medium text-brand-charcoal focus:outline-none placeholder:text-brand-muted/60"
                  />
                </div>
              </div>

              {/* Field 2: Budget */}
              <div className="p-3 bg-brand-offwhite rounded-xl border border-brand-border/50 focus-within:border-brand-orange transition-colors">
                <label className="block text-[10px] font-semibold text-brand-muted uppercase tracking-wider mb-1">
                  Mức ngân sách
                </label>
                <div className="flex items-center gap-2">
                  <Wallet className="text-brand-orange w-4 h-4 shrink-0" />
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full bg-transparent text-sm font-medium text-brand-charcoal focus:outline-none cursor-pointer"
                  >
                    <option value="Tiết kiệm (Dưới 5 triệu)">Tiết kiệm (Dưới 5 triệu)</option>
                    <option value="Cân bằng (5 - 15 triệu)">Cân bằng (5 - 15 triệu)</option>
                    <option value="Cao cấp (Trải nghiệm xa xỉ)">Cao cấp (Trải nghiệm xa xỉ)</option>
                  </select>
                </div>
              </div>

              {/* Field 3: Duration */}
              <div className="p-3 bg-brand-offwhite rounded-xl border border-brand-border/50 focus-within:border-brand-orange transition-colors">
                <label className="block text-[10px] font-semibold text-brand-muted uppercase tracking-wider mb-1">
                  Thời gian chuyến đi
                </label>
                <div className="flex items-center gap-2">
                  <Calendar className="text-brand-orange w-4 h-4 shrink-0" />
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-transparent text-sm font-medium text-brand-charcoal focus:outline-none cursor-pointer"
                  >
                    <option value="Cuối tuần (2 Ngày 1 Đêm)">Cuối tuần (2 Ngày 1 Đêm)</option>
                    <option value="Vừa đủ (3 Ngày 2 Đêm)">Vừa đủ (3 Ngày 2 Đêm)</option>
                    <option value="Trọn vẹn (5 - 7 Ngày)">Trọn vẹn (5 - 7 Ngày)</option>
                  </select>
                </div>
              </div>

              {/* CTA Button */}
              <button
                type="submit"
                className="h-full min-h-[52px] bg-brand-orange hover:bg-brand-orange-hover text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Khám Phá Ngay</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 3. Brand Philosophy / Editorial Statement */}
      <section id="about" className="py-24 px-6 lg:px-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Large Editorial Statement */}
          <div className="lg:col-span-7">
            <span className="text-xs font-mono text-brand-orange uppercase tracking-widest block mb-4">
              {"// Triết lý Tripz"}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-[1.2] text-brand-charcoal font-normal mb-8">
              &ldquo;Du lịch không chỉ là chuyển động cơ học giữa hai điểm đến, mà là{" "}
              <span className="italic font-semibold text-brand-orange">nghệ thuật cảm nhận</span> chiều sâu văn hóa và bản ngã.&rdquo;
            </h2>

            <div className="space-y-4 text-brand-muted leading-relaxed font-light text-base sm:text-lg">
              <p className="dropcap">
                Tripz sinh ra từ mong muốn xóa bỏ những lịch trình rập khuôn, gượng ép. Chúng tôi kết hợp trí tuệ nhân tạo tiên tiến với nguồn cảm hứng từ những nhà du hành bản địa thực thụ để mang lại cho bạn hành trình mang đậm dấu ấn riêng.
              </p>
              <p>
                Dù bạn tìm kiếm cảm giác tĩnh lặng giữa sương mờ Tây Bắc hay nhịp sống sôi động của biển xanh ngắt phương Nam, Tripz đồng hành để mọi khoảnh khắc của bạn đều trở thành một thiên tiểu thuyết đáng nhớ.
              </p>
            </div>

            {/* Minimal Counter Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 pt-10 mt-10 border-t border-brand-border">
              <div>
                <div className="font-serif text-3xl sm:text-4xl text-brand-charcoal font-semibold">
                  50.000+
                </div>
                <div className="text-xs text-brand-muted uppercase tracking-wider mt-1">
                  Hành trình đã tạo
                </div>
              </div>
              <div>
                <div className="font-serif text-3xl sm:text-4xl text-brand-charcoal font-semibold">
                  4.9/5.0
                </div>
                <div className="text-xs text-brand-muted uppercase tracking-wider mt-1">
                  Đánh giá trải nghiệm
                </div>
              </div>
              <div>
                <div className="font-serif text-3xl sm:text-4xl text-brand-charcoal font-semibold">
                  63/63
                </div>
                <div className="text-xs text-brand-muted uppercase tracking-wider mt-1">
                  Tỉnh thành bao phủ
                </div>
              </div>
            </div>
          </div>

          {/* Right Asymmetric Image Composition */}
          <div className="lg:col-span-5 relative">
            <div className="relative z-10 h-[480px] overflow-hidden rounded-2xl shadow-2xl img-zoom-container">
              <Image
                src="https://images.unsplash.com/photo-1509030450996-93f2e3d8ed05?q=80&w=1000&auto=format&fit=crop"
                alt="Góc nhìn lữ khách"
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover"
              />
            </div>
            {/* Offset Accent Card */}
            <div className="absolute -bottom-6 -left-6 z-20 bg-brand-cream border border-brand-border p-6 rounded-2xl shadow-xl max-w-xs hidden sm:block">
              <Quote className="w-8 h-8 text-brand-orange mb-2 block fill-brand-orange/20" />
              <p className="font-serif text-sm italic text-brand-slate">
                &ldquo;Tripz giúp tôi tìm thấy một Hội An hoàn toàn khác—thong dong, thanh bình và đúng như mơ ước.&rdquo;
              </p>
              <span className="text-xs font-semibold text-brand-charcoal block mt-3">
                — Minh Trí, Founder @ DesignLab
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Featured Destinations (Cảm Hứng Điểm Đến) */}
      <section id="destinations" className="py-20 px-6 lg:px-16 bg-brand-cream/50 border-y border-brand-border">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-xs font-mono text-brand-orange uppercase tracking-widest block mb-2">
                Bộ Sưu Tập Mùa Này
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-brand-charcoal font-normal">
                Cảm Hứng Điểm Đến
              </h2>
            </div>
            <p className="text-brand-muted text-sm max-w-md">
              Những tọa độ được tuyển chọn tinh tế nhất dành cho tâm hồn yêu thiên nhiên, nghệ thuật và di sản Việt Nam.
            </p>
          </div>

          {/* Asymmetrical Photo Editorial Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Card 1: Sa Pa (Large) */}
            <Link
              href="/explore?q=Sapa"
              className="md:col-span-7 group relative h-[420px] rounded-2xl overflow-hidden shadow-md cursor-pointer img-zoom-container block"
            >
              <Image
                src="https://images.unsplash.com/photo-1540611025311-01df3cef54b5?q=80&w=1200&auto=format&fit=crop"
                alt="Sa Pa"
                fill
                sizes="(max-width: 768px) 100vw, 58vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-mono">
                21°C • Mây ngàn
              </div>
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="text-brand-orange text-xs uppercase tracking-widest font-semibold">
                  Tây Bắc Mơ Màng
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-normal mt-1">
                  Sapa — Sương Mờ & Ruộng Bậc Thang
                </h3>
                <p className="text-xs sm:text-sm text-white/80 line-clamp-2 mt-2 font-light">
                  Chinh phục đỉnh Fansipan, nhâm nhi cà phê bản Cát Cát và đắm mình trong cái lạnh nguyên bản.
                </p>
              </div>
            </Link>

            {/* Card 2: Hội An */}
            <Link
              href="/explore?q=Hội+An"
              className="md:col-span-5 group relative h-[420px] rounded-2xl overflow-hidden shadow-md cursor-pointer img-zoom-container block"
            >
              <Image
                src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1000&auto=format&fit=crop"
                alt="Hội An"
                fill
                sizes="(max-width: 768px) 100vw, 42vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-mono">
                28°C • Hoài cổ
              </div>
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="text-brand-orange text-xs uppercase tracking-widest font-semibold">
                  Di Sản Miền Trung
                </span>
                <h3 className="font-serif text-2xl font-normal mt-1">
                  Hội An — Đèn Lồng & Phố Cổ
                </h3>
                <p className="text-xs sm:text-sm text-white/80 line-clamp-2 mt-2 font-light">
                  Thả hoa đăng trên sông Hoài và thưởng thức nét ẩm thực tinh tế tạc cùng thời gian.
                </p>
              </div>
            </Link>

            {/* Card 3: Ninh Bình */}
            <Link
              href="/explore?q=Ninh+Bình"
              className="md:col-span-4 group relative h-[360px] rounded-2xl overflow-hidden shadow-md cursor-pointer img-zoom-container block"
            >
              <Image
                src="https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=800&auto=format&fit=crop"
                alt="Ninh Bình"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="text-brand-orange text-xs uppercase tracking-widest font-semibold">
                  Sơn Thủy Hữu Tình
                </span>
                <h3 className="font-serif text-xl font-normal mt-1">
                  Ninh Bình — Tràng An
                </h3>
              </div>
            </Link>

            {/* Card 4: Nha Trang */}
            <Link
              href="/explore?q=Nha+Trang"
              className="md:col-span-4 group relative h-[360px] rounded-2xl overflow-hidden shadow-md cursor-pointer img-zoom-container block"
            >
              <Image
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop"
                alt="Nha Trang"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="text-brand-orange text-xs uppercase tracking-widest font-semibold">
                  Biển Xanh Cát Trắng
                </span>
                <h3 className="font-serif text-xl font-normal mt-1">
                  Nha Trang — Vịnh Ngọc
                </h3>
              </div>
            </Link>

            {/* Card 5: Phú Quốc */}
            <Link
              href="/explore?q=Phú+Quốc"
              className="md:col-span-4 group relative h-[360px] rounded-2xl overflow-hidden shadow-md cursor-pointer img-zoom-container block"
            >
              <Image
                src="https://images.unsplash.com/photo-1512100356356-de1b84283e18?q=80&w=800&auto=format&fit=crop"
                alt="Phú Quốc"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="text-brand-orange text-xs uppercase tracking-widest font-semibold">
                  Hoàng Hôn Phương Nam
                </span>
                <h3 className="font-serif text-xl font-normal mt-1">
                  Phú Quốc — Đảo Ngọc
                </h3>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Real Live Published Trips from API */}
      {liveTrips && liveTrips.length > 0 && (
        <section className="py-20 px-6 lg:px-16 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-mono text-brand-orange uppercase tracking-widest block mb-2">
                {"// Tuyển Chọn Thực Tế"}
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-brand-charcoal font-normal">
                Lộ Trình Công Khai Mới Nhất
              </h2>
              <p className="text-brand-muted text-sm mt-2 max-w-lg">
                Các chuyến đi thực tế từ cộng đồng, đã được xuất bản và sẵn sàng để bạn tham khảo hoặc clone về tài khoản.
              </p>
            </div>
            <Link
              href="/explore"
              className="text-xs font-mono uppercase tracking-widest text-brand-orange hover:text-brand-orange-hover flex items-center gap-1.5 font-bold"
            >
              Xem tất cả ({liveTrips.length}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveTrips.slice(0, 6).map((trip) => (
              <Link
                key={trip.id}
                href={`/trip/${trip.id}`}
                className="bg-white border border-brand-border rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-brand-orange/50 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-brand-muted mb-3">
                    <span className="bg-brand-orange/10 text-brand-orange px-2.5 py-1 rounded-full font-sans font-bold">
                      {trip.budgetAmount.toLocaleString("vi-VN")} {trip.currency}
                    </span>
                    <span>
                      {trip.startDate} – {trip.endDate}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl font-normal text-brand-charcoal group-hover:text-brand-orange transition-colors">
                    {trip.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-muted line-clamp-2 mt-2 font-light">
                    {trip.description ?? "Hành trình thực tế sẵn sàng để bạn khám phá và clone."}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-brand-border/60 flex items-center justify-between text-xs font-semibold text-brand-orange">
                  <span>Khám phá & Clone</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 5. How Tripz Works (Trải Nghiệm Độc Bản) */}
      <section id="experience" className="py-24 px-6 lg:px-16 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-xs font-mono text-brand-orange uppercase tracking-widest block mb-2">
            {"// Tiến Trình Đơn Giản"}
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl text-brand-charcoal font-normal">
            Trải Nghiệm Độc Bản Với 3 Bước
          </h2>
          <p className="text-brand-muted text-sm sm:text-base mt-4">
            Công nghệ thông minh đằng sau sự thong dong của bạn trong suốt hành trình.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
          {/* Connecting Line for Desktop */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-[1px] bg-brand-border -translate-y-12 z-0" />

          {/* Step 1 */}
          <div className="relative z-10 bg-brand-offwhite border border-brand-border p-8 rounded-2xl hover:border-brand-orange transition-all duration-300 hover:-translate-y-1 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center font-mono font-bold text-lg mb-6">
              01
            </div>
            <h3 className="font-serif text-xl text-brand-charcoal font-semibold mb-3">
              Chọn Cảm Hứng & Phong Cách
            </h3>
            <p className="text-brand-muted text-sm leading-relaxed">
              Chia sẻ gu du lịch của bạn: Thong dong nghỉ dưỡng, phiêu lưu mạo hiểm hay đắm chìm trong di sản ẩm thực.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative z-10 bg-brand-offwhite border border-brand-border p-8 rounded-2xl hover:border-brand-orange transition-all duration-300 hover:-translate-y-1 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center font-mono font-bold text-lg mb-6">
              02
            </div>
            <h3 className="font-serif text-xl text-brand-charcoal font-semibold mb-3">
              AI Tối Ưu Lịch Trình Nhanh
            </h3>
            <p className="text-brand-muted text-sm leading-relaxed">
              Thuật toán thông minh sắp xếp tuyến đường, dự toán chi phí, khoảng cách di chuyển và gợi ý thời điểm lý tưởng nhất.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative z-10 bg-brand-offwhite border border-brand-border p-8 rounded-2xl hover:border-brand-orange transition-all duration-300 hover:-translate-y-1 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center font-mono font-bold text-lg mb-6">
              03
            </div>
            <h3 className="font-serif text-xl text-brand-charcoal font-semibold mb-3">
              Tận Hưởng Chuyến Đi Trọn Vẹn
            </h3>
            <p className="text-brand-muted text-sm leading-relaxed">
              Sở hữu cuốn e-journal du lịch sắc nét trên điện thoại. Dễ dàng tinh chỉnh ngay cả khi đang trên đường đi.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Interactive Experience / Testimonials Showcase (Góc Nhìn Lữ Khách) */}
      <section id="community" className="py-24 px-6 lg:px-16 bg-brand-charcoal text-white relative overflow-hidden">
        {/* Subtle Glow Background */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-orange/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 border-b border-white/10 pb-8">
            <div>
              <span className="text-xs font-mono text-brand-orange uppercase tracking-widest block mb-2">
                {"// Lữ Khách Nói Gì"}
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-light text-white">
                Góc Nhìn Lữ Khách
              </h2>
            </div>
            <p className="text-white/60 text-sm max-w-md">
              Những câu chuyện truyền cảm hứng từ cộng đồng yêu dịch chuyển cùng Tripz.
            </p>
          </div>

          {/* Magazine Editorial Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quote 1 */}
            <div className="bg-brand-slate/60 border border-white/10 p-8 sm:p-10 rounded-2xl flex flex-col justify-between hover:border-brand-orange/50 transition-colors">
              <p className="font-serif text-lg sm:text-xl font-light text-white/90 italic leading-relaxed mb-8">
                &ldquo;Tripz tiết kiệm cho tôi hàng tuần liền tìm kiếm thông tin lẻ tẻ trên mạng. Lịch trình AI đề xuất cực kỳ chính xác về thời gian di chuyển, lại có những quán cà phê ẩn mình vô cùng gu.&rdquo;
              </p>
              <div className="flex items-center gap-4">
                <Image
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"
                  alt="Linh Hải"
                  width={48}
                  height={48}
                  sizes="48px"
                  className="w-12 h-12 rounded-full object-cover border border-brand-orange"
                />
                <div>
                  <h4 className="font-semibold text-sm text-white">Hải Linh</h4>
                  <span className="text-xs text-white/50">Travel Blogger • Hà Nội</span>
                </div>
              </div>
            </div>

            {/* Quote 2 */}
            <div className="bg-brand-slate/60 border border-white/10 p-8 sm:p-10 rounded-2xl flex flex-col justify-between hover:border-brand-orange/50 transition-colors">
              <p className="font-serif text-lg sm:text-xl font-light text-white/90 italic leading-relaxed mb-8">
                &ldquo;Cảm giác cầm một lịch trình thiết kế đẹp như tạp chí Kinfolk khiến mỗi bước chân du lịch trở nên thư thái hơn hẳn. Tôi đặc biệt thích tính năng ước tính ngân sách thông minh.&rdquo;
              </p>
              <div className="flex items-center gap-4">
                <Image
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop"
                  alt="Trần Đạt"
                  width={48}
                  height={48}
                  sizes="48px"
                  className="w-12 h-12 rounded-full object-cover border border-brand-orange"
                />
                <div>
                  <h4 className="font-semibold text-sm text-white">Trần Hoàng Đạt</h4>
                  <span className="text-xs text-white/50">Architect • TP. Hồ Chí Minh</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CTA Section (Bắt Đầu Hành Trình Của Bạn) */}
      <section className="py-24 px-6 lg:px-16 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-brand-charcoal via-brand-slate to-brand-charcoal text-white rounded-3xl p-8 sm:p-14 lg:p-20 relative overflow-hidden shadow-2xl text-center">
          {/* Warm Orange Glow Accent */}
          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-orange/30 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <span className="text-xs font-mono text-brand-orange uppercase tracking-widest">
              Sẵn Sàng Cho Chuyến Đi Tiếp Theo?
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-light leading-tight">
              Bắt Đầu Hành Trình <br />
              <span className="italic text-brand-orange">Độc Bản</span> Của Bạn Ngay Hôm Nay
            </h2>
            <p className="text-white/70 text-sm sm:text-base font-light max-w-xl mx-auto">
              Nhập email để nhận bản tin cảm hứng du lịch tuần này và khởi tạo kế hoạch hoàn toàn miễn phí.
            </p>

            {/* Input Form */}
            <form onSubmit={handleNewsletterSubmit} className="pt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Địa chỉ email của bạn..."
                required
                className="w-full px-5 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-brand-orange text-sm backdrop-blur-md"
              />
              <button
                type="submit"
                className="whitespace-nowrap bg-brand-orange hover:bg-brand-orange-hover text-white text-sm font-semibold px-7 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl cursor-pointer"
              >
                Khám Phá
              </button>
            </form>
            {newsletterNotice && (
              <p className="mt-4 text-sm text-green-300 font-medium" role="status">
                {newsletterNotice}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="bg-brand-cream border-t border-brand-border pt-16 pb-12 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-brand-border/60">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="font-serif text-3xl font-bold tracking-tight text-brand-charcoal block">
              Tripz<span className="text-brand-orange">.</span>
            </Link>
            <p className="text-brand-muted text-sm leading-relaxed max-w-sm font-light">
              Tripz là ấn bản du lịch thông minh, tôn vinh vẻ đẹp thiên nhiên và văn hóa Việt Nam thông qua những trải nghiệm may đo đẳng cấp.
            </p>
            <div className="flex items-center gap-4 text-brand-charcoal text-xl pt-2">
              <a href="#" aria-label="Instagram" className="hover:text-brand-orange transition-colors">
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a href="#" aria-label="Facebook" className="hover:text-brand-orange transition-colors">
                <FacebookIcon className="w-5 h-5" />
              </a>
              <a href="#" aria-label="Youtube" className="hover:text-brand-orange transition-colors">
                <YoutubeIcon className="w-5 h-5" />
              </a>
              <a href="#" aria-label="TikTok" className="hover:text-brand-orange transition-colors">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.87-4.49V8.58a8.28 8.28 0 0 0 4.9 1.6V6.69z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Nav Links Column 1 */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-mono uppercase text-brand-charcoal font-bold tracking-wider">
              Khám Phá
            </h4>
            <ul className="space-y-2 text-sm text-brand-muted">
              <li>
                <a href="#destinations" className="hover:text-brand-orange transition-colors">
                  Tây Bắc
                </a>
              </li>
              <li>
                <a href="#destinations" className="hover:text-brand-orange transition-colors">
                  Di Sản Miền Trung
                </a>
              </li>
              <li>
                <a href="#destinations" className="hover:text-brand-orange transition-colors">
                  Biển Đảo Phương Nam
                </a>
              </li>
              <li>
                <a href="#destinations" className="hover:text-brand-orange transition-colors">
                  Văn Hóa Ẩm Thực
                </a>
              </li>
            </ul>
          </div>

          {/* Nav Links Column 2 */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-mono uppercase text-brand-charcoal font-bold tracking-wider">
              Sản Phẩm
            </h4>
            <ul className="space-y-2 text-sm text-brand-muted">
              <li>
                <Link href="/planner/new" className="hover:text-brand-orange transition-colors">
                  Tạo Lịch Trình AI
                </Link>
              </li>
              <li>
                <Link href="/explore" className="hover:text-brand-orange transition-colors">
                  Bộ Sưu Tập Mẫu
                </Link>
              </li>
              <li>
                <Link href="/feed" className="hover:text-brand-orange transition-colors">
                  Cộng Đồng Lữ Khách
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-brand-orange transition-colors">
                  Ứng Dụng Di Động
                </a>
              </li>
            </ul>
          </div>

          {/* Nav Links Column 3 */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-mono uppercase text-brand-charcoal font-bold tracking-wider">
              Về Tripz
            </h4>
            <ul className="space-y-2 text-sm text-brand-muted">
              <li>
                <a href="#about" className="hover:text-brand-orange transition-colors">
                  Câu Chuyện Thương Hiệu
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-brand-orange transition-colors">
                  Tuyển Dụng
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-brand-orange transition-colors">
                  Điều Khoản & Bảo Mật
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-brand-orange transition-colors">
                  Liên Hệ Truyền Thông
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright Bottom */}
        <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-brand-muted gap-4">
          <p>© 2026 Tripz Vietnam Inc. Tất cả quyền được bảo lưu.</p>
          <p className="font-serif italic text-brand-slate">
            Designed for free spirits & mindful travelers.
          </p>
        </div>
      </footer>
    </div>
  );
}
