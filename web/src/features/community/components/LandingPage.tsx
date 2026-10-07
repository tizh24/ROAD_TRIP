"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, MouseEvent, useState } from "react";
import {
  ArrowRight,
  Menu,
  X,
  Star,
  CheckCircle2,
  Sparkles,
  Play,
  Navigation,
  MapPin,
  Users,
  ShieldCheck,
  Camera,
  Compass,
  Calendar,
  Heart,
  Send,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import heroImage from "@/assets/images/roadtrip-hero.png";

const destinations = [
  {
    name: "Hà Giang",
    tag: "Đông Bắc",
    detail: "5 ngày trên những cung đèo ngoạn mục",
    cost: "2.4 tr / người",
    days: "5 ngày",
    image: heroImage,
  },
  {
    name: "Hội An",
    tag: "Di sản",
    detail: "Cuối tuần chậm rãi bên sông Hoài và phố cổ",
    cost: "1.8 tr / người",
    days: "3 ngày",
    image: heroImage,
  },
  {
    name: "Phú Yên",
    tag: "Biển & Gió",
    detail: "4 ngày đón bình minh trên ghềnh đá hoang sơ",
    cost: "2.2 tr / người",
    days: "4 ngày",
    image: heroImage,
  },
] as const;

const services = [
  {
    icon: Compass,
    color: "bg-[#fff4eb] text-[#f4765b]",
    label: "Hành trình",
    title: "Lên cung đường",
    text: "Gom điểm dừng, thời gian và quãng đường vào một hành trình dễ theo dõi.",
  },
  {
    icon: Users,
    color: "bg-[#fef2f2] text-[#d95f4a]",
    label: "Bạn đồng hành",
    title: "Đi cùng nhau",
    text: "Mời bạn đồng hành, chia việc chuẩn bị và cập nhật kế hoạch trong một chỗ.",
    featured: true,
  },
  {
    icon: ShieldCheck,
    color: "bg-[#ecfdf5] text-[#059669]",
    label: "Chuẩn bị",
    title: "Đi tự tin hơn",
    text: "Lưu checklist, ghi chú an toàn và những điều cần chuẩn bị trước giờ xuất phát.",
  },
  {
    icon: Camera,
    color: "bg-[#eff6ff] text-[#2563eb]",
    label: "Kỷ niệm",
    title: "Giữ lại kỷ niệm",
    text: "Biến những bức ảnh và ghi chú dọc đường thành câu chuyện của cả chuyến đi.",
  },
] as const;

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setMessage("Hãy nhập một địa chỉ email hợp lệ.");
      return;
    }
    setMessage("Tính năng nhận tin đang được chuẩn bị. Chúng tôi chưa lưu địa chỉ email của bạn.");
  }

  function scrollToSection(event: MouseEvent<HTMLAnchorElement>, sectionId: string) {
    event.preventDefault();
    const section = document.getElementById(sectionId);
    if (!section) return;
    window.history.replaceState(null, "", `#${sectionId}`);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    section.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }

  return (
    <div className="landing-page min-h-screen bg-[#fffdf9] text-[#202750] antialiased overflow-x-hidden">
      {/* HEADER */}
      <header className="fixed top-0 inset-x-0 z-50 h-16 sm:h-20 2xl:h-24 bg-[#fffdf9]/95 backdrop-blur-md border-b border-[#e9e7e2] px-5 sm:px-8 xl:px-12 2xl:px-16 flex items-center justify-between transition-all duration-300">
        <Link href="/" className="flex items-center gap-2.5 text-xl 2xl:text-2xl font-extrabold tracking-[-.05em] text-[#202750]">
          <span className="flex h-9 w-9 2xl:h-11 2xl:w-11 items-center justify-center rounded-full bg-[#d95f4a] text-white shadow-sm">
            <Compass size={20} className="2xl:w-6 2xl:h-6" />
          </span>
          Road Trip<span className="text-[#d95f4a]">.</span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden items-center gap-8 2xl:gap-12 text-sm 2xl:text-base font-semibold text-[#59627d] lg:flex" aria-label="Điều hướng chính">
          <a onClick={(event) => scrollToSection(event, "diem-den")} className="focus-ring transition-colors hover:text-[#d95f4a]" href="#diem-den">
            Điểm đến
          </a>
          <a onClick={(event) => scrollToSection(event, "dich-vu")} className="focus-ring transition-colors hover:text-[#d95f4a]" href="#dich-vu">
            Trải nghiệm
          </a>
          <a onClick={(event) => scrollToSection(event, "cach-hoat-dong")} className="focus-ring transition-colors hover:text-[#d95f4a]" href="#cach-hoat-dong">
            Cách hoạt động
          </a>
          <Link className="focus-ring transition-colors hover:text-[#d95f4a]" href="/explore">
            Khám phá
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-5 2xl:gap-7 lg:flex">
          <Link href="/login" className="focus-ring px-2 py-2 text-sm 2xl:text-base font-semibold text-[#202750] transition-colors hover:text-[#d95f4a]">
            Đăng nhập
          </Link>
          <Link
            href="/trips/new"
            className="focus-ring inline-flex items-center gap-2 rounded-full bg-[#d95f4a] px-5 py-2.5 2xl:px-7 2xl:py-3.5 text-sm 2xl:text-base font-bold text-white shadow-sm transition-all duration-200 active:scale-95 hover:bg-[#c64e3d] hover:shadow-md"
          >
            <Sparkles size={15} className="2xl:w-4 2xl:h-4" /> Lập chuyến đi
          </Link>
        </div>

        {/* Mobile Toggle Button */}
        <button
          type="button"
          aria-label={menuOpen ? "Đóng điều hướng" : "Mở điều hướng"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="focus-ring inline-flex rounded-md p-2 text-[#202750] lg:hidden"
        >
          {menuOpen ? <X size={25} /> : <Menu size={25} />}
        </button>

        {/* Mobile Nav Drawer */}
        {menuOpen ? (
          <nav className="absolute left-4 right-4 top-[4.25rem] grid rounded-2xl border border-[#e5e3ef] bg-white p-4 shadow-xl lg:hidden" aria-label="Điều hướng di động">
            <a
              onClick={(event) => {
                setMenuOpen(false);
                scrollToSection(event, "diem-den");
              }}
              className="focus-ring rounded-lg px-4 py-3 font-semibold text-[#202750] hover:bg-[#fff4ef]"
              href="#diem-den"
            >
              Điểm đến
            </a>
            <a
              onClick={(event) => {
                setMenuOpen(false);
                scrollToSection(event, "dich-vu");
              }}
              className="focus-ring rounded-lg px-4 py-3 font-semibold text-[#202750] hover:bg-[#fff4ef]"
              href="#dich-vu"
            >
              Trải nghiệm
            </a>
            <a
              onClick={(event) => {
                setMenuOpen(false);
                scrollToSection(event, "cach-hoat-dong");
              }}
              className="focus-ring rounded-lg px-4 py-3 font-semibold text-[#202750] hover:bg-[#fff4ef]"
              href="#cach-hoat-dong"
            >
              Cách hoạt động
            </a>
            <Link onClick={() => setMenuOpen(false)} className="focus-ring rounded-lg px-4 py-3 font-semibold text-[#202750] hover:bg-[#fff4ef]" href="/explore">
              Khám phá
            </Link>
            <Link onClick={() => setMenuOpen(false)} className="focus-ring rounded-lg px-4 py-3 font-semibold text-[#202750] hover:bg-[#fff4ef]" href="/login">
              Đăng nhập
            </Link>
            <Link onClick={() => setMenuOpen(false)} className="focus-ring mt-2 rounded-full bg-[#d95f4a] px-4 py-3 text-center font-bold text-white transition-all active:scale-95 shadow-sm" href="/trips/new">
              Lập chuyến đi
            </Link>
          </nav>
        ) : null}
      </header>

      {/* MAIN CONTENT */}
      <main className="pt-16 sm:pt-20 2xl:pt-24">
        {/* HERO SECTION */}
        <section className="relative mx-auto w-full max-w-7xl 2xl:max-w-[1560px] px-5 sm:px-8 xl:px-12 2xl:px-16 py-8 lg:py-12 2xl:py-16 min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] 2xl:min-h-[calc(100vh-6rem)] flex items-center">
          <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 -z-10 h-[500px] w-[500px] 2xl:h-[680px] 2xl:w-[680px] rounded-full bg-[#ffeedb]/60 blur-3xl" />

          <div className="grid w-full items-center gap-10 lg:gap-14 2xl:gap-20 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <div className="relative z-10 max-w-xl 2xl:max-w-2xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[#f4765b]/30 bg-[#fff4ef] px-4 py-1.5 2xl:px-5 2xl:py-2 text-xs 2xl:text-sm font-bold uppercase tracking-wider text-[#d95f4a]">
                <Sparkles size={13} className="text-[#d95f4a] 2xl:w-4 2xl:h-4" />
                Kế hoạch cho những chuyến đi thật
              </div>

              {/* Title with brush stroke accent */}
              <h1 className="mt-4 text-[2.5rem] font-extrabold leading-[1.08] tracking-[-.045em] text-[#202750] sm:text-5xl xl:text-[3.6rem] 2xl:text-[4.25rem] 2xl:leading-[1.06]">
                Đi xa hơn theo{" "}
                <span className="relative inline-block text-[#d95f4a]">
                  cách của riêng bạn.
                  <svg
                    aria-hidden="true"
                    className="absolute -bottom-2 left-0 w-full text-[#d95f4a]/80"
                    viewBox="0 0 255 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M3 9C60 2 195 2 252 9" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
                  </svg>
                </span>
              </h1>

              <p className="mt-6 2xl:mt-8 max-w-lg 2xl:max-w-xl text-base 2xl:text-lg leading-7 2xl:leading-8 text-[#66708f]">
                Road Trip đồng hành cùng bạn từ lúc ấp ủ ý tưởng, tự động tạo khung hành trình, rủ đúng cạ cứng và lưu giữ mọi kỷ niệm dọc đường.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 2xl:mt-10 flex flex-wrap items-center gap-5 2xl:gap-6">
                <Link
                  href="/trips/new"
                  className="focus-ring inline-flex items-center gap-2 rounded-xl bg-[#d95f4a] px-7 py-3.5 2xl:px-9 2xl:py-4 text-sm 2xl:text-base font-bold text-white shadow-[0_8px_20px_rgba(217,95,74,.25)] transition-all duration-200 active:scale-95 hover:bg-[#c64e3d] hover:shadow-[0_12px_24px_rgba(217,95,74,.35)]"
                >
                  Lập chuyến đi ngay <ArrowRight size={16} className="2xl:w-5 2xl:h-5" />
                </Link>
                <Link
                  href="/explore"
                  className="focus-ring group inline-flex items-center gap-3 text-sm 2xl:text-base font-bold text-[#30385e] transition-colors hover:text-[#d95f4a]"
                >
                  <span className="flex h-11 w-11 2xl:h-13 2xl:w-13 items-center justify-center rounded-full bg-[#d95f4a] text-white shadow-[0_6px_16px_rgba(217,95,74,.3)] transition-transform duration-200 group-hover:scale-105 active:scale-95">
                    <Play size={15} className="fill-white translate-x-0.5 2xl:w-4 2xl:h-4" />
                  </span>
                  Xem hành trình mẫu
                </Link>
              </div>

              {/* Stats Bar */}
              <div className="mt-10 2xl:mt-14 grid grid-cols-3 gap-4 2xl:gap-8 border-t border-[#ebe8e2] pt-6 2xl:pt-8 text-left">
                <div>
                  <p className="text-xl 2xl:text-3xl font-extrabold text-[#202750]">10,000+</p>
                  <p className="mt-0.5 text-xs 2xl:text-sm font-semibold text-[#747b96]">Phượt thủ đồng hành</p>
                </div>
                <div>
                  <p className="text-xl 2xl:text-3xl font-extrabold text-[#202750]">500+</p>
                  <p className="mt-0.5 text-xs 2xl:text-sm font-semibold text-[#747b96]">Cung đường gợi ý</p>
                </div>
                <div>
                  <p className="flex items-center gap-1.5 text-xl 2xl:text-3xl font-extrabold text-[#202750]">
                    4.9 <Star size={16} className="fill-[#f59e0b] text-[#f59e0b] 2xl:w-5 2xl:h-5" />
                  </p>
                  <p className="mt-0.5 text-xs 2xl:text-sm font-semibold text-[#747b96]">Đánh giá yêu thích</p>
                </div>
              </div>
            </div>

            {/* Hero Image Container - Co giãn tối ưu cho màn lớn 24 inch */}
            <div className="relative mx-auto w-full max-w-xl 2xl:max-w-2xl aspect-[1.05/1] sm:aspect-[1.15/1] lg:max-h-[500px] xl:max-h-[540px] 2xl:max-h-[620px]">
              <div aria-hidden="true" className="absolute right-[-5%] top-[-5%] h-[85%] w-[75%] rounded-bl-[45%] rounded-tl-[50%] bg-[#fff0df]" />

              <div className="absolute inset-x-[4%] bottom-0 top-[4%] overflow-hidden rounded-[2rem] 2xl:rounded-[2.5rem] bg-[#f3d5b9] shadow-[0_20px_45px_rgba(33,39,79,.13)] sm:inset-x-[6%] sm:top-0">
                <Image
                  priority
                  fill
                  sizes="(min-width: 1536px) 45vw, (min-width: 1024px) 50vw, 92vw"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  src={heroImage}
                  alt="Du khách ngắm thung lũng núi Việt Nam lúc bình minh"
                />
                <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(28,37,75,.02),rgba(28,37,75,.2))]" />
              </div>

              {/* Floating Badge Top Right */}
              <div className="hidden sm:flex absolute right-[2%] top-[8%] items-center gap-2 rounded-full bg-white/95 backdrop-blur-md px-4 py-2.5 2xl:px-5 2xl:py-3 shadow-[0_12px_24px_rgba(33,39,79,.1)] border border-[#e5e3ef]">
                <CheckCircle2 size={18} className="text-[#10b981] 2xl:w-5 2xl:h-5" />
                <p className="text-xs 2xl:text-sm font-bold text-[#202750]">Checklist tự động hoàn thành</p>
              </div>

              {/* Floating Card Bottom Left */}
              <div className="absolute bottom-[4%] left-0 rounded-2xl 2xl:rounded-3xl bg-white px-4 py-3.5 2xl:px-5 2xl:py-4.5 shadow-[0_14px_28px_rgba(33,39,79,.12)] border border-[#e5e3ef] sm:left-[2%] transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 2xl:h-7 2xl:w-7 items-center justify-center rounded-full bg-[#fff4ef] text-[#d95f4a]">
                    <MapPin size={13} className="2xl:w-4 2xl:h-4" />
                  </span>
                  <p className="text-xs 2xl:text-sm font-semibold text-[#747b96]">Chuyến đi gần nhất</p>
                </div>
                <p className="mt-1 text-sm 2xl:text-base font-extrabold text-[#202750]">Đà Nẵng - Huế</p>
                <p className="mt-0.5 text-xs 2xl:text-sm font-bold text-[#d95f4a]">3 ngày, 4 người bạn</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 1: ĐIỂM ĐẾN (#diem-den) */}
        <section
          id="diem-den"
          className="scroll-mt-16 sm:scroll-mt-20 2xl:scroll-mt-24 relative bg-[#fff9ef] px-5 sm:px-8 xl:px-12 2xl:px-16 min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] 2xl:min-h-[calc(100vh-6rem)] flex flex-col justify-center py-8 lg:py-12 2xl:py-16"
        >
          <div className="mx-auto w-full max-w-7xl 2xl:max-w-[1560px]">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs 2xl:text-sm font-bold uppercase tracking-[.12em] text-[#7e86a1]">Chọn một nơi để bắt đầu</p>
                <h2 id="diem-den-title" className="mt-1.5 text-2xl font-extrabold tracking-[-.045em] text-[#202750] sm:text-3xl lg:text-4xl 2xl:text-5xl">
                  Điểm đến được yêu thích
                </h2>
              </div>
              <Link href="/explore" className="focus-ring inline-flex items-center gap-2 text-sm 2xl:text-base font-bold text-[#d95f4a] transition-colors hover:text-[#b84637]">
                Khám phá tất cả <ArrowRight size={17} className="2xl:w-5 2xl:h-5" />
              </Link>
            </div>

            {/* Destination cards - Tự động scale tỉ lệ đẹp mắt giữa màn 16" và 24" */}
            <div className="relative mt-8 2xl:mt-12 grid gap-6 2xl:gap-8 md:grid-cols-3">
              {destinations.map((destination, index) => (
                <Link
                  href="/explore"
                  key={destination.name}
                  className={`focus-ring group relative overflow-hidden rounded-2xl 2xl:rounded-3xl bg-white shadow-[0_12px_28px_rgba(36,43,80,.07)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_44px_rgba(36,43,80,.13)] ${
                    index === 1 ? "md:translate-y-2 md:hover:translate-y-0" : ""
                  }`}
                >
                  <div className="relative aspect-[16/10] 2xl:aspect-[16/10.5] overflow-hidden">
                    <Image
                      fill
                      sizes="(min-width: 1536px) 30vw, (min-width: 768px) 33vw, 100vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                      src={destination.image}
                      alt={`Cảnh quan ${destination.name}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-75" />
                    <span className="absolute left-3.5 top-3.5 2xl:left-4.5 2xl:top-4.5 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 2xl:px-4 2xl:py-1.5 text-xs 2xl:text-sm font-bold text-[#202750] shadow-sm">
                      {destination.tag}
                    </span>
                  </div>

                  <div className="p-4 sm:p-5 2xl:p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base sm:text-lg 2xl:text-xl font-extrabold text-[#202750] group-hover:text-[#d95f4a] transition-colors">
                        {destination.name}
                      </h3>
                      <span className="text-sm 2xl:text-base font-extrabold text-[#d95f4a]">{destination.cost}</span>
                    </div>
                    <p className="mt-1 2xl:mt-2 text-xs 2xl:text-sm leading-5 2xl:leading-6 text-[#747b96] line-clamp-1">{destination.detail}</p>
                    <div className="mt-3.5 2xl:mt-5 flex items-center justify-between border-t border-[#f0eee9] pt-3 2xl:pt-4 text-xs 2xl:text-sm font-bold text-[#59627d]">
                      <span className="flex items-center gap-1.5">
                        <Navigation size={13} className="text-[#d95f4a] fill-[#d95f4a] 2xl:w-4 2xl:h-4" />
                        {destination.days}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[#d95f4a] group-hover:translate-x-0.5 transition-transform">
                        Chi tiết <ArrowRight size={13} className="2xl:w-4 2xl:h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}

              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-6 -right-6 -z-0 hidden xl:block text-[#e6e2d9]/60"
              >
                <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                  <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" />
                  <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: TRẢI NGHIỆM (#dich-vu) */}
        <section
          id="dich-vu"
          className="scroll-mt-16 sm:scroll-mt-20 2xl:scroll-mt-24 relative px-5 sm:px-8 xl:px-12 2xl:px-16 min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] 2xl:min-h-[calc(100vh-6rem)] flex flex-col justify-center py-8 lg:py-12 2xl:py-16"
        >
          <div className="mx-auto w-full max-w-7xl 2xl:max-w-[1560px]">
            <div className="mx-auto max-w-2xl 2xl:max-w-3xl text-center">
              <p className="text-xs 2xl:text-sm font-bold uppercase tracking-[.12em] text-[#7e86a1]">Những gì Road Trip mang đến</p>
              <h2 id="dich-vu-title" className="mt-1.5 text-2xl font-extrabold tracking-[-.045em] text-[#202750] sm:text-3xl lg:text-4xl 2xl:text-5xl">
                Mọi thứ bạn cần cho một chuyến đi đáng nhớ
              </h2>
            </div>

            <div className="mt-10 lg:mt-12 2xl:mt-16 grid gap-6 2xl:gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {services.map((service) => {
                const IconComponent = service.icon;
                const isFeatured = "featured" in service && service.featured;

                return (
                  <article
                    key={service.title}
                    className={`group relative rounded-2xl 2xl:rounded-3xl p-6 2xl:p-8 transition-all duration-300 hover:-translate-y-1.5 ${
                      isFeatured
                        ? "bg-white shadow-[0_16px_36px_rgba(217,95,74,.12)] border border-[#fed7cc]"
                        : "bg-[#fffdfb] border border-[#eeebe4] hover:bg-white hover:shadow-[0_16px_32px_rgba(36,43,80,.08)] hover:border-transparent"
                    }`}
                  >
                    {isFeatured ? (
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-2.5 -left-2.5 -z-10 h-16 w-16 2xl:h-20 2xl:w-20 rounded-[1.25rem] 2xl:rounded-[1.5rem] bg-[#d95f4a] transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : null}

                    <div className={`flex h-12 w-12 2xl:h-16 2xl:w-16 items-center justify-center rounded-xl 2xl:rounded-2xl ${service.color} shadow-sm`}>
                      <IconComponent size={24} className="2xl:w-7 2xl:h-7" />
                    </div>

                    <p className="mt-4 2xl:mt-5 text-xs 2xl:text-sm font-bold uppercase tracking-wider text-[#d95f4a]">{service.label}</p>
                    <h3 className="mt-1.5 text-base sm:text-lg 2xl:text-xl font-extrabold text-[#202750]">{service.title}</h3>
                    <p className="mt-2 text-xs sm:text-sm 2xl:text-base leading-6 2xl:leading-7 text-[#737b96]">{service.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* SECTION 3: CÁCH HOẠT ĐỘNG (#cach-hoat-dong) */}
        <section
          id="cach-hoat-dong"
          className="scroll-mt-16 sm:scroll-mt-20 2xl:scroll-mt-24 relative px-5 sm:px-8 xl:px-12 2xl:px-16 min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] 2xl:min-h-[calc(100vh-6rem)] flex flex-col justify-center py-8 lg:py-12 2xl:py-16"
        >
          <div className="mx-auto grid w-full max-w-7xl 2xl:max-w-[1560px] items-center gap-10 lg:gap-14 2xl:gap-20 xl:grid-cols-[1fr_1.05fr]">
            <div>
              <p className="text-xs 2xl:text-sm font-bold uppercase tracking-[.12em] text-[#7e86a1]">Nhanh và rõ ràng</p>
              <h2 id="cach-hoat-dong-title" className="mt-1.5 max-w-md 2xl:max-w-lg text-2xl font-extrabold tracking-[-.045em] text-[#202750] sm:text-3xl lg:text-4xl 2xl:text-5xl">
                Lập chuyến đi trong ba nhịp đơn giản
              </h2>
              <ol className="mt-8 2xl:mt-10 space-y-6 2xl:space-y-8">
                <Step
                  icon={MapPin}
                  iconColor="bg-[#f1a501]"
                  label="Bước 1"
                  title="nơi muốn đến"
                  text="Ghim những điểm bạn muốn ghé và để Road Trip tạo khung hành trình thuận tiện nhất."
                />
                <Step
                  icon={Users}
                  iconColor="bg-[#d95f4a]"
                  label="Bước 2"
                  title="người đồng hành"
                  text="Chia sẻ kế hoạch để mọi người cùng thêm ý tưởng, biểu quyết và chia sẻ chi phí."
                />
                <Step
                  icon={Camera}
                  iconColor="bg-[#0d9488]"
                  label="Bước 3"
                  title="mọi khoảnh khắc"
                  text="Theo dõi lịch trình, đánh dấu kỷ niệm và kể lại hành trình của bạn với cộng đồng."
                />
              </ol>
            </div>

            {/* Right Preview Card - Co giãn phóng khoáng trên màn lớn */}
            <div className="relative mx-auto w-full max-w-md 2xl:max-w-xl">
              <div aria-hidden="true" className="pointer-events-none absolute -right-6 -top-6 -z-10 h-64 w-64 2xl:h-80 2xl:w-80 rounded-full bg-[#59b1e6]/15 blur-3xl" />

              <div className="rounded-2xl 2xl:rounded-3xl bg-white p-4 sm:p-5 2xl:p-6 shadow-[0_20px_45px_rgba(36,43,80,.1)] border border-[#edebe6] transition-transform duration-300 hover:-translate-y-1">
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl 2xl:rounded-2xl">
                  <Image
                    fill
                    sizes="(min-width: 1536px) 35vw, (min-width: 1024px) 42vw, 90vw"
                    className="object-cover transition-transform duration-500 hover:scale-105"
                    src={heroImage}
                    alt="Khung cảnh một chuyến đi trên đường núi"
                  />
                </div>

                <div className="p-2 pt-4 2xl:pt-5">
                  <h3 className="text-base sm:text-lg 2xl:text-xl font-extrabold text-[#202750]">Vòng quanh Hà Giang</h3>
                  <p className="mt-0.5 text-xs 2xl:text-sm font-semibold text-[#848a9e]">12 - 16 Tháng 11 | bởi Chu Thanh</p>

                  <div className="mt-3.5 2xl:mt-5 flex items-center gap-2.5 2xl:gap-3.5">
                    <span className="flex h-8 w-8 2xl:h-10 2xl:w-10 items-center justify-center rounded-full bg-[#f5f5f7] text-[#59627d]">
                      <MapPin size={14} className="2xl:w-4 2xl:h-4" />
                    </span>
                    <span className="flex h-8 w-8 2xl:h-10 2xl:w-10 items-center justify-center rounded-full bg-[#f5f5f7] text-[#59627d]">
                      <Calendar size={14} className="2xl:w-4 2xl:h-4" />
                    </span>
                    <span className="flex h-8 w-8 2xl:h-10 2xl:w-10 items-center justify-center rounded-full bg-[#f5f5f7] text-[#59627d]">
                      <Send size={14} className="2xl:w-4 2xl:h-4" />
                    </span>
                  </div>

                  <div className="mt-4 2xl:mt-5 flex items-center justify-between border-t border-[#f0eee9] pt-3 2xl:pt-4 text-xs 2xl:text-sm text-[#737b96]">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Users size={14} className="text-[#d95f4a] 2xl:w-4 2xl:h-4" /> 4 người bạn cùng đi
                    </span>
                    <button type="button" aria-label="Yêu thích chuyến đi" className="text-[#f4765b] hover:scale-110 transition-transform">
                      <Heart size={16} className="fill-[#f4765b] 2xl:w-5 2xl:h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Floating Mini Ongoing Card */}
              <div className="absolute -bottom-5 -right-3 sm:-right-6 2xl:-bottom-6 2xl:-right-8 w-56 sm:w-60 2xl:w-72 rounded-xl 2xl:rounded-2xl bg-white p-3.5 2xl:p-4.5 shadow-[0_14px_30px_rgba(36,43,80,.14)] border border-[#edebe6] transition-transform duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-2.5 2xl:gap-3">
                  <span className="flex h-9 w-9 2xl:h-11 2xl:w-11 shrink-0 items-center justify-center rounded-full bg-[#fff4ef] text-[#d95f4a]">
                    <Compass size={18} className="2xl:w-5 2xl:h-5" />
                  </span>
                  <div className="flex-1">
                    <p className="text-[10px] 2xl:text-xs font-semibold text-[#8e94a8]">Đang diễn ra</p>
                    <p className="text-xs 2xl:text-sm font-extrabold text-[#202750]">Đèo Mã Pí Lèng</p>
                    <div className="mt-1.5 2xl:mt-2">
                      <div className="flex justify-between text-[10px] 2xl:text-xs font-bold text-[#202750]">
                        <span>Checklist</span>
                        <span className="text-[#d95f4a]">65%</span>
                      </div>
                      <div className="mt-1 2xl:mt-1.5 h-1.5 2xl:h-2 w-full rounded-full bg-[#f2f0ec]">
                        <div className="h-full w-[65%] rounded-full bg-[#d95f4a]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: TESTIMONIALS */}
        <section className="bg-[#fff9ef] px-5 sm:px-8 lg:py-24 2xl:py-28 xl:px-12 2xl:px-16">
          <div className="mx-auto grid max-w-7xl 2xl:max-w-[1560px] items-center gap-12 2xl:gap-16 xl:grid-cols-[.9fr_1.1fr]">
            <div>
              <p className="text-xs 2xl:text-sm font-bold uppercase tracking-[.12em] text-[#7e86a1]">Cộng đồng Road Trip</p>
              <h2 className="mt-2 text-3xl 2xl:text-4xl font-extrabold tracking-[-.045em] text-[#202750]">
                Những câu chuyện khiến người ta muốn lên đường
              </h2>

              <div className="mt-8 flex items-center gap-2" aria-hidden="true">
                <span className="h-3 w-3 rounded-full bg-[#d95f4a]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#dedbd5]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#dedbd5]" />
              </div>
            </div>

            <div className="relative flex items-center gap-4">
              <div className="relative flex-1">
                <div aria-hidden="true" className="absolute -bottom-4 left-6 right-0 -z-10 h-full rounded-2xl border border-[#ebe8e2] bg-white/60 shadow-sm" />

                <blockquote className="relative rounded-2xl 2xl:rounded-3xl border border-[#ebe8e2] bg-white p-7 sm:p-9 2xl:p-12 shadow-[0_16px_36px_rgba(36,43,80,.07)] transition-all duration-300">
                  <div className="absolute -left-5 -top-5 2xl:-left-6 2xl:-top-6 flex h-14 w-14 2xl:h-16 2xl:w-16 items-center justify-center rounded-full border-4 border-white bg-[#d95f4a] text-sm 2xl:text-base font-black text-white shadow-md">
                    MT
                  </div>

                  <p className="text-base sm:text-lg 2xl:text-xl font-semibold leading-8 2xl:leading-9 text-[#4a5475] pt-2">
                    “Tụi mình đã có một chuyến đi bốn ngày rất nhẹ nhàng vì ai cũng biết cần chuẩn bị gì và đang ở đâu trong kế hoạch.”
                  </p>
                  <footer className="mt-6 2xl:mt-8">
                    <cite className="not-italic font-extrabold text-[#202750] 2xl:text-lg">Minh Trang</cite>
                    <p className="text-xs 2xl:text-sm text-[#7e86a1]">TP. Hồ Chí Minh · Phượt thủ cung Đông Bắc</p>
                  </footer>
                </blockquote>
              </div>

              <div className="hidden sm:flex flex-col gap-3 text-[#7e86a1]">
                <button type="button" aria-label="Xem nhận xét trước" className="focus-ring rounded-full border border-[#dedbd5] p-2 hover:border-[#d95f4a] hover:text-[#d95f4a]">
                  <ChevronUp size={16} />
                </button>
                <button type="button" aria-label="Xem nhận xét kế tiếp" className="focus-ring rounded-full border border-[#dedbd5] p-2 hover:border-[#d95f4a] hover:text-[#d95f4a]">
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: NEWSLETTER CTA */}
        <section className="px-5 py-16 sm:px-8 lg:py-24 2xl:py-28 xl:px-12 2xl:px-16">
          <div className="relative mx-auto max-w-7xl 2xl:max-w-[1560px] overflow-hidden rounded-3xl 2xl:rounded-[2.5rem] border border-[#fedfd6] bg-[#fff5f0] px-6 py-14 2xl:py-20 text-center sm:px-14 2xl:px-20 shadow-sm">
            <div
              aria-hidden="true"
              className="absolute -top-3 -right-3 flex h-16 w-16 2xl:h-20 2xl:w-20 items-center justify-center rounded-full bg-[#d95f4a] text-white shadow-lg rotate-12"
            >
              <Send size={22} className="-translate-x-0.5 translate-y-0.5 2xl:w-6 2xl:h-6" />
            </div>

            <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 -left-10 h-56 w-56 2xl:h-80 2xl:w-80 rounded-full bg-[#fce3d9]/50 blur-2xl" />

            <div className="relative z-10">
              <h2 className="mx-auto max-w-2xl 2xl:max-w-3xl text-2xl font-extrabold tracking-[-.04em] text-[#202750] sm:text-4xl 2xl:text-5xl">
                Nhận cảm hứng cho chuyến đi kế tiếp
              </h2>
              <p className="mx-auto mt-3 2xl:mt-4 max-w-lg 2xl:max-w-2xl text-sm 2xl:text-base leading-6 2xl:leading-8 text-[#737b96]">
                Bản tin chỉ sẵn sàng khi dịch vụ đăng ký hoàn thiện. Bạn luôn biết rõ dữ liệu của mình có được lưu hay không.
              </p>

              <form onSubmit={submitEmail} className="mx-auto mt-8 2xl:mt-10 flex max-w-lg 2xl:max-w-xl flex-col gap-3 sm:flex-row">
                <label className="sr-only" htmlFor="landing-email">
                  Email của bạn
                </label>
                <input
                  id="landing-email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="focus-ring min-h-12 2xl:min-h-14 flex-1 rounded-xl 2xl:rounded-2xl border border-[#e1ded9] bg-white px-4 2xl:px-5 text-sm 2xl:text-base text-[#30385e] placeholder:text-[#a1a6ba]"
                  type="email"
                  placeholder="Email của bạn"
                />
                <button
                  className="focus-ring min-h-12 2xl:min-h-14 rounded-xl 2xl:rounded-2xl bg-[#d95f4a] px-7 2xl:px-9 text-sm 2xl:text-base font-bold text-white shadow-sm transition-all duration-200 active:scale-95 hover:bg-[#c64e3d] hover:shadow-md"
                  type="submit"
                >
                  Nhận cập nhật
                </button>
              </form>

              {message ? (
                <p className="relative mx-auto mt-4 max-w-lg text-sm text-[#556080]" role="status">
                  {message}
                </p>
              ) : null}
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="mx-auto grid w-full max-w-7xl 2xl:max-w-[1560px] gap-10 px-5 pb-10 pt-8 sm:grid-cols-[1.4fr_repeat(3,.8fr)] sm:px-8 xl:px-12 2xl:px-16">
        <div>
          <Link href="/" className="text-lg 2xl:text-xl font-extrabold tracking-[-.05em] text-[#202750]">
            Road Trip<span className="text-[#d95f4a]">.</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm 2xl:text-base leading-6 2xl:leading-7 text-[#7e86a1]">
            Lên đường cùng những người bạn, những câu chuyện và cung đường của riêng bạn.
          </p>
        </div>
        <FooterLinks
          title="Khám phá"
          links={[
            ["Điểm đến", "/explore"],
            ["Chuyến đi mẫu", "/explore"],
            ["Cộng đồng", "/feed"],
          ]}
        />
        <FooterLinks
          title="Sản phẩm"
          links={[
            ["Lập chuyến đi", "/trips/new"],
            ["Lộ trình của tôi", "/trips"],
            ["Hồ sơ", "/profile"],
          ]}
        />
        <FooterLinks
          title="Hỗ trợ"
          links={[
            ["Đăng nhập", "/login"],
            ["Khám phá", "/explore"],
            ["Trang chủ", "/"],
          ]}
        />
        <p className="sm:col-span-4 border-t border-[#eceaf2] pt-6 text-xs 2xl:text-sm text-[#9298ad]">
          © 2026 Road Trip. Hành trình được lên kế hoạch rõ ràng hơn.
        </p>
      </footer>
    </div>
  );
}

/* Sub-components */
function Step({
  icon: Icon,
  iconColor,
  label,
  title,
  text,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconColor: string;
  label: string;
  title: string;
  text: string;
}) {
  return (
    <li className="flex items-start gap-4 2xl:gap-5">
      <div className={`flex h-11 w-11 2xl:h-14 2xl:w-14 shrink-0 items-center justify-center rounded-xl 2xl:rounded-2xl ${iconColor} text-white shadow-sm`}>
        <Icon size={20} className="2xl:w-6 2xl:h-6" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs 2xl:text-sm font-bold uppercase tracking-wider text-[#d95f4a]">{label}</span>
          <h3 className="font-extrabold text-[#202750] 2xl:text-xl">{title}</h3>
        </div>
        <p className="mt-1 text-xs sm:text-sm 2xl:text-base leading-6 2xl:leading-7 text-[#737b96]">{text}</p>
      </div>
    </li>
  );
}

function FooterLinks({
  title,
  links,
}: {
  title: string;
  links: readonly (readonly [string, string])[];
}) {
  return (
    <div>
      <h2 className="text-sm 2xl:text-base font-extrabold text-[#202750]">{title}</h2>
      <ul className="mt-4 2xl:mt-5 space-y-3 2xl:space-y-4">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link className="focus-ring text-sm 2xl:text-base text-[#737b96] transition-colors hover:text-[#d95f4a]" href={href}>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
