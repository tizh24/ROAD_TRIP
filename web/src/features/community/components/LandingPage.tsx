"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Bike, Car, Check, CircleAlert, Compass, MapPin, Mountain, Route, ShieldCheck, Wallet } from "lucide-react";

const routeDays = [
  ["N1", "Đà Nẵng → Đèo Hải Vân", "43 km", "Khởi hành từ Sơn Trà, dừng lại ở đỉnh đèo trước khi xuống Lăng Cô."],
  ["N2", "Lăng Cô → Cố đô Huế", "69 km", "Đi qua đầm Lập An, vào thành nội khi nắng chiều dịu lại."],
  ["N3", "Huế và đường về duyên hải", "Linh hoạt", "Dành thời gian cho lăng tẩm, trà sen và những con đường nhỏ."],
] as const;

const checks = ["Áp suất và rãnh lốp xe", "Hệ thống phanh trước và sau", "Dầu nhớt động cơ và nước làm mát", "Đèn pha, đèn cốt và xi nhan", "Túi y tế khẩn cấp và bộ vá lốp"] as const;

export default function LandingPage() {
  const [vehicle, setVehicle] = useState<"bike" | "car">("bike");
  const [checked, setChecked] = useState(() => new Set<number>([0, 1]));

  return (
    <main className="bg-background text-text-main">
      <section className="page-shell px-0 pb-12 pt-7 sm:px-6 sm:pb-16 sm:pt-10 lg:pt-14">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-bold tracking-wide text-secondary">
              <Compass size={15} /> Chuyên gia đường trường số 1 Việt Nam
            </div>
            <h1 className="mt-5 max-w-xl text-[2.15rem] font-extrabold leading-[1.08] tracking-[-.045em] sm:text-5xl">
              Khám phá mọi dặm đường <span className="text-primary">cùng TripZ</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-text-sub">
              Nền tảng dẫn lối hành trình tự lái xe máy và ô tô. Tối ưu cung đèo, thời gian lái xe và chi phí cùng nhóm bạn đồng hành.
            </p>

            <div className="mt-6 rounded-panel bg-white p-4 shadow-card sm:p-5">
              <div className="flex flex-col gap-3 border-b border-border-light pb-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs font-bold uppercase tracking-[.12em] text-text-sub">Phương thức di chuyển</span>
                <div className="grid w-full grid-cols-2 rounded-lg bg-surface-container p-1 sm:inline-flex sm:w-fit">
                  <button type="button" onClick={() => setVehicle("bike")} className={`focus-ring inline-flex items-center justify-center gap-1.5 rounded px-2 py-2 text-xs font-bold sm:px-3 sm:py-1.5 ${vehicle === "bike" ? "bg-primary text-white" : "text-text-sub"}`}><Bike size={15} /> Xe máy</button>
                  <button type="button" onClick={() => setVehicle("car")} className={`focus-ring inline-flex items-center justify-center gap-1.5 rounded px-2 py-2 text-xs font-bold sm:px-3 sm:py-1.5 ${vehicle === "car" ? "bg-primary text-white" : "text-text-sub"}`}><Car size={15} /> Ô tô</button>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Place label="Điểm khởi hành" value="Đà Nẵng (Sơn Trà)" />
                <Place label="Điểm kết thúc" value="Cố đô Huế (Đại Nội)" />
              </div>
              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm"><span className="inline-flex items-center gap-1.5 font-bold text-primary"><Route size={16} /> 112 km</span><span className="inline-flex items-center gap-1.5 font-bold text-amber-700"><Mountain size={16} /> 1 đèo lớn</span></div>
                <Link href="/explore" className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-hover">Xem lộ trình <ArrowRight size={16} /></Link>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-7 gap-y-4 text-sm text-text-sub">
              <Stat value="42.000+" label="Cung đường đã lưu" /><Stat value="98,4%" label="Độ an toàn báo trước" /><Stat value="GPS" label="Hỗ trợ offline" />
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="overflow-hidden rounded-[16px] bg-white shadow-card">
                <div className="relative h-[20rem] overflow-hidden sm:h-[500px]">
                <Image src="https://images.unsplash.com/photo-1541628951107-a55850900b9d?auto=format&fit=crop&w=1600&q=85" alt="Cung đường ven biển giữa Đà Nẵng và Huế" fill priority unoptimized className="object-cover" sizes="(min-width: 1024px) 50vw, 100vw" />
                <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(251,249,245,.2),rgba(16,42,67,.38))]" />
                <svg aria-hidden="true" className="absolute inset-0 h-full w-full" viewBox="0 0 600 500" fill="none"><path d="M475 420C430 365 370 333 326 270S245 215 195 155 125 95 90 70" stroke="#f59e0b" strokeDasharray="8 7" strokeLinecap="round" strokeWidth="5" /><path d="M475 420C430 365 370 333 326 270S245 215 195 155 125 95 90 70" stroke="#fff7e2" strokeLinecap="round" strokeOpacity=".65" strokeWidth="1.5" /></svg>
                <div className="absolute left-4 top-4 flex gap-4 rounded-xl bg-white/95 p-3 shadow-sm backdrop-blur"><Metric label="Thời gian lái" value="3h 45m" /><div className="w-px bg-border-main" /><Metric label="Độ cao cực đại" value="496 m" accent /></div>
                <Marker className="bottom-10 right-[12%]" label="Đà Nẵng (Km 0)" number="1" />
                <Marker className="left-[44%] top-[45%]" label="Đèo Hải Vân" number="2" warn />
                <Marker className="left-[13%] top-[13%]" label="Cố đô Huế" number="3" />
                <div className="absolute bottom-4 left-4 rounded-lg bg-white/95 px-3 py-2 text-xs font-semibold text-text-main shadow-sm">Đèo khô ráo · Tầm nhìn &gt; 10 km</div>
              </div>
              <div className="flex items-center justify-between gap-4 p-4"><div><p className="text-xs font-bold uppercase tracking-[.12em] text-text-sub">Lộ trình gợi ý</p><p className="mt-1 font-bold">Đà Nẵng · Hải Vân · Lăng Cô · Huế</p></div><Link href="/login" className="focus-ring shrink-0 rounded-lg border border-primary px-3 py-2 text-sm font-bold text-primary hover:bg-primary hover:text-white">Bắt đầu</Link></div>
            </div>
          </div>
        </div>
      </section>

      <section id="itinerary" className="bg-surface-container-low py-16"><div className="page-shell grid gap-10 px-4 sm:px-6 lg:grid-cols-12"><div className="lg:col-span-8"><p className="text-xs font-bold uppercase tracking-[.14em] text-primary">Một hành trình có nhịp độ vừa đủ</p><h2 className="mt-3 text-3xl font-extrabold tracking-[-.035em] sm:text-4xl">Ba ngày từ thành phố đến cố đô.</h2><div className="mt-8 space-y-4">{routeDays.map(([day, title, distance, description]) => <article key={day} className="grid gap-4 rounded-panel bg-white p-5 sm:grid-cols-[3.5rem_1fr_auto] sm:items-start"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary font-bold text-white">{day}</div><div><h3 className="font-bold text-text-main">{title}</h3><p className="mt-2 text-sm leading-6 text-text-sub">{description}</p></div><span className="text-sm font-bold text-primary">{distance}</span></article>)}</div></div><aside className="lg:col-span-4"><div className="rounded-panel bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-[.14em] text-text-sub">Dự toán mỗi người</p><div className="mt-5 space-y-3 text-sm text-text-sub"><Cost name="Nhiên liệu" amount="180.000 đ" /><Cost name="Lưu trú 2 đêm" amount="650.000 đ" /><Cost name="Ăn uống và vé" amount="650.000 đ" /></div><div className="mt-5 flex items-center justify-between border-t border-border-light pt-4 font-bold text-primary"><span>Tổng ước tính</span><span>1.480.000 đ</span></div><Link href="/trips/new" className="focus-ring mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary-hover"><Wallet size={16} /> Tạo chuyến đi này</Link></div></aside></div></section>

      <section className="page-shell grid gap-10 px-4 py-16 sm:px-6 lg:grid-cols-12"><div className="lg:col-span-7"><div className="inline-flex items-center gap-2 text-sm font-bold text-primary"><ShieldCheck size={19} /> An toàn là trên hết</div><h2 className="mt-3 text-3xl font-extrabold tracking-[-.035em] sm:text-4xl">Checklist trước giờ xuất phát.</h2><p className="mt-4 max-w-2xl text-sm leading-6 text-text-sub">Đường đèo đổi thời tiết rất nhanh. Kiểm tra xe trước khi đi giúp cả nhóm chủ động hơn trên hành trình.</p><div className="mt-7 space-y-2">{checks.map((item, index) => <label key={item} className="flex cursor-pointer items-start gap-3 rounded-xl bg-surface-container-low p-4"><input type="checkbox" checked={checked.has(index)} onChange={() => setChecked((current) => { const next = new Set(current); if (next.has(index)) next.delete(index); else next.add(index); return next; })} className="mt-0.5 h-5 w-5 accent-primary" /><span className="flex-1 text-sm font-bold">{index + 1}. {item}</span>{checked.has(index) && <Check size={18} className="text-primary" />}</label>)}</div></div><aside className="lg:col-span-5"><div className="rounded-[16px] bg-secondary p-6 text-white"><CircleAlert className="text-amber-200" /><h2 className="mt-5 text-xl font-extrabold">Mạng lưới cứu hộ đèo 24/7</h2><p className="mt-3 text-sm leading-6 text-white/75">Lưu liên hệ khẩn cấp trước khi khởi hành. Khi mất sóng, hãy ưu tiên dừng tại trạm an toàn gần nhất.</p><div className="mt-6 rounded-xl bg-white/10 p-4"><p className="text-xs font-bold uppercase tracking-[.12em] text-white/60">Hỗ trợ hành trình</p><p className="mt-1 text-lg font-bold">1900 6824</p></div></div></aside></section>
    </main>
  );
}

function Place({ label, value }: { label: string; value: string }) { return <div className="rounded-lg bg-surface-container-low p-3"><p className="text-[11px] font-bold uppercase tracking-[.12em] text-text-sub">{label}</p><p className="mt-1 text-sm font-bold text-text-main">{value}</p></div>; }
function Stat({ value, label }: { value: string; label: string }) { return <div><p className="font-extrabold text-text-main">{value}</p><p className="mt-0.5 text-xs">{label}</p></div>; }
function Metric({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) { return <div><p className="text-[10px] font-bold uppercase tracking-[.1em] text-text-sub">{label}</p><p className={`mt-0.5 text-sm font-extrabold ${accent ? "text-amber-700" : "text-text-main"}`}>{value}</p></div>; }
function Marker({ className, label, number, warn = false }: { className: string; label: string; number: string; warn?: boolean }) { return <div className={`absolute flex flex-col items-center ${className}`}><span className="mb-1 hidden rounded bg-white px-2 py-1 text-[11px] font-bold text-text-main shadow sm:block">{label}</span><span aria-label={label} className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ring-4 ${warn ? "bg-amber-700 ring-amber-100" : "bg-primary ring-emerald-100"}`}>{warn ? <MapPin size={15} /> : number}</span></div>; }
function Cost({ name, amount }: { name: string; amount: string }) { return <div className="flex justify-between gap-3"><span>{name}</span><span className="font-bold text-text-main">{amount}</span></div>; }
