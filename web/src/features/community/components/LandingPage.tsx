"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CalendarDays, Check, HeartPulse, MapPin, Menu, Route, ShieldCheck, WalletCards, X } from "lucide-react";
import heroImage from "@/assets/images/roadtrip-hero.png";
import styles from "./LandingPage.module.css";

const stats = [["42.000+", "Cung đường đã lưu"], ["98.4%", "Độ an toàn lộ trình"], ["100%", "Hỗ trợ bản đồ offline"]] as const;
const features = [
  { icon: CalendarDays, title: "Lên kế hoạch thông minh", text: "Tự động sắp xếp hành trình theo thời gian, quãng đường và nhịp đi riêng của bạn." },
  { icon: Route, title: "Bản đồ & Cung đường", text: "Đọc điều kiện đường, điểm ngắm cảnh và những chặng dừng đáng để rẽ vào." },
  { icon: WalletCards, title: "Chia sẻ & Phân bổ chi phí", text: "Cùng bạn đồng hành theo dõi chi tiêu để mỗi người chỉ cần tận hưởng hành trình." },
] as const;
const itinerary = [["01", "Đà Nẵng → Đèo Hải Vân → Lăng Cô", "Bắt đầu bên biển, băng qua con đèo ôm lấy vịnh xanh."], ["02", "Lăng Cô → Đầm Cầu Hai → Huế", "Chậm lại giữa đầm phá và những sắc vàng cố đô."], ["03", "Khám phá Lăng Tẩm & Lối về duyên hải", "Khép lại bằng một Huế sâu lắng trước khi trở về biển."]] as const;
const checklist = ["Lốp & áp suất", "Hệ thống phanh", "Dầu nhớt & nước làm mát", "Đèn pha, xi nhan & còi", "Túi y tế & vật dụng khẩn cấp"];

function scrollTo(id: string) { document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); }

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return <div className={styles.page}>
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link href="/" className={styles.brand} aria-label="Tripz — Trang chủ"><span className={styles.brandMark}><Route size={19} strokeWidth={2.25} /></span><span>Tripz</span></Link>
        <nav className={styles.desktopNav} aria-label="Điều hướng chính"><a href="#kham-pha">Khám phá</a><a href="#cach-hoat-dong">Cách hoạt động</a><Link href="/feed">Cộng đồng</Link></nav>
        <div className={styles.actions}><Link className={styles.login} href="/login">Đăng nhập</Link><Link className={styles.primaryButton} href="/trips/new">Bắt đầu lên kế hoạch <ArrowRight size={16} /></Link><span className={styles.avatar} aria-hidden="true">T</span></div>
        <button className={styles.menuButton} type="button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label={menuOpen ? "Đóng điều hướng" : "Mở điều hướng"}>{menuOpen ? <X /> : <Menu />}</button>
      </div>
      {menuOpen && <nav className={styles.mobileNav} aria-label="Điều hướng di động"><button type="button" onClick={() => { setMenuOpen(false); scrollTo("kham-pha"); }}>Khám phá</button><button type="button" onClick={() => { setMenuOpen(false); scrollTo("cach-hoat-dong"); }}>Cách hoạt động</button><Link href="/feed" onClick={() => setMenuOpen(false)}>Cộng đồng</Link><Link href="/login" onClick={() => setMenuOpen(false)}>Đăng nhập</Link><Link href="/trips/new" onClick={() => setMenuOpen(false)} className={styles.primaryButton}>Bắt đầu lên kế hoạch <ArrowRight size={16} /></Link></nav>}
    </header>
    <main>
      <section className={styles.hero}>
        <div className={styles.heroCopy}><p className={styles.kicker}>Khám phá Việt Nam theo cách của bạn</p><h1>Mọi cung đường.<br />Một <em>hành trình</em><br />đáng nhớ.</h1><p className={styles.lede}>Từ những cung đường ven biển đến hành trình xuyên núi. Tripz giúp bạn lên kế hoạch, khám phá và tận hưởng từng kilomet.</p><div className={styles.heroActions}><Link href="/trips/new" className={styles.primaryButton}>Lên kế hoạch chuyến đi <ArrowRight size={17} /></Link><Link href="/explore" className={styles.secondaryButton}>Khám phá cung đường</Link></div>
          <section className={styles.planner} aria-label="Gợi ý hành trình Đà Nẵng đến Huế"><div className={styles.plannerField}><MapPin size={17} /><span><small>Điểm khởi hành</small>Đà Nẵng</span></div><div className={styles.plannerField}><Route size={17} /><span><small>Điểm đến</small>Huế</span></div><div className={styles.plannerField}><CalendarDays size={17} /><span><small>Ngày khởi hành</small>Chọn khi tạo hành trình</span></div><Link href="/trips/new" className={styles.plannerSubmit}>Tạo hành trình <ArrowRight size={16} /></Link></section>
        </div>
        <div className={styles.heroVisual}><div className={styles.imageFrame}><Image src={heroImage} priority fill sizes="(min-width: 1024px) 54vw, 100vw" alt="Cung đường núi ven biển Việt Nam nhìn từ trên cao" /><div className={styles.routeLine} aria-hidden="true"><i /><i /><i /></div><div className={styles.routeLabels} aria-label="Tuyến đường Đà Nẵng, Đèo Hải Vân, Huế"><span>Đà Nẵng</span><span>Đèo Hải Vân</span><span>Huế</span></div></div><aside className={styles.routePanel}><div><p>Đà Nẵng <ArrowRight size={13} /> Huế</p><strong>112 km</strong></div><span>02 giờ 48 phút</span></aside><p className={styles.photoCaption}>Đèo Hải Vân, Thừa Thiên Huế<br /><span>16°02′B · 108°11′Đ</span></p></div>
      </section>
      <section className={styles.stats} aria-label="Thông tin Tripz">{stats.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</section>
      <section id="cach-hoat-dong" className={styles.features}><div className={styles.sectionIntro}><p className={styles.kicker}>Hành trình thông minh hơn</p><h2>Mọi thứ bạn cần,<br />trên một hành trình.</h2><p>Tập trung vào trải nghiệm. Để Tripz lo phần còn lại.</p></div><div className={styles.featureList}>{features.map(({ icon: Icon, title, text }, index) => <article className={styles.feature} key={title}><span className={styles.featureNumber}>0{index + 1}</span><span className={styles.featureIcon}><Icon size={22} /></span><h3>{title}</h3><p>{text}</p><Link href={index === 1 ? "/explore" : "/trips/new"}>Khám phá tính năng <ArrowRight size={15} /></Link></article>)}</div></section>
      <section id="kham-pha" className={styles.featured}><div className={styles.featuredImage}><Image src={heroImage} fill sizes="(min-width: 1024px) 50vw, 100vw" alt="Khung cảnh cung di sản miền Trung" /><span>Cung di sản miền Trung</span><p>Đèo Hải Vân mở ra một dải biển xanh<br />trước khi dẫn về cố đô Huế.</p></div><div className={styles.itineraryContent}><p className={styles.kicker}>Hành trình được yêu thích</p><h2>Khám phá Việt Nam,<br />từng cung đường.</h2><h3>Cung Di Sản Miền Trung <span>— 3 Ngày 2 Đêm</span></h3><div className={styles.tripFacts}><span>112 km</span><span>3 ngày</span><span>Xe máy / ô tô</span><span>từ 2,8 triệu</span></div><ol className={styles.timeline}>{itinerary.map(([day, title, text]) => <li key={day}><b>{day}</b><div><h4>{title}</h4><p>{text}</p></div></li>)}</ol><Link href="/explore" className={styles.textLink}>Xem chi tiết hành trình <ArrowRight size={16} /></Link></div></section>
      <section className={styles.safety}><div className={styles.sectionIntro}><p className={styles.kicker}>An toàn trên mọi hành trình</p><h2>An tâm trên<br />từng kilomet.</h2><p>Chuẩn bị kỹ lưỡng trước mỗi chuyến đi với checklist thông minh và thông tin hỗ trợ khẩn cấp.</p></div><div className={styles.safetyGrid}><div className={styles.checklist}><h3>Kiểm tra phương tiện</h3>{checklist.map((item) => <div key={item}><span><Check size={15} /></span>{item}</div>)}<Link href="/trips/new" className={styles.textLink}>Mở checklist đầy đủ <ArrowRight size={16} /></Link></div><aside className={styles.assistance}><HeartPulse size={26} /><p>Hỗ trợ cứu hộ 24/7</p><strong>1900 6868</strong><span>Đường dây hỗ trợ khẩn cấp</span><hr /><div><ShieldCheck size={17} /> Bản đồ offline luôn sẵn sàng</div><Link href="/trips/new">Truy cập liên hệ khẩn cấp <ArrowRight size={16} /></Link></aside></div></section>
      <section className={styles.finalCta}><p>Khởi hành cùng cộng đồng Tripz</p><h2>Sẵn sàng cho những<br />cung đường tuyệt đẹp?</h2><span>Tạo hành trình đầu tiên và bắt đầu khám phá Việt Nam theo cách của riêng bạn.</span><div><Link href="/trips/new">Tạo hành trình đầu tiên <ArrowRight size={16} /></Link><Link href="/explore">Khám phá cung đường</Link></div></section>
    </main>
    <footer className={styles.footer}><div><Link href="/" className={styles.brand}><span className={styles.brandMark}><Route size={18} /></span>Tripz</Link><p>Một người bạn đồng hành cho những hành trình Việt Nam đáng nhớ.</p></div><nav aria-label="Liên kết chân trang"><Link href="/explore">Khám phá</Link><Link href="/feed">Cộng đồng</Link><Link href="/login">Điều khoản</Link><Link href="/login">Bảo mật</Link><Link href="/login">Hỗ trợ</Link></nav><small>© 2026 Tripz. Dành cho những hành trình dài đáng nhớ.</small></footer>
  </div>;
}
