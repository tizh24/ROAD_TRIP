import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Wallet } from "lucide-react";
import heroImage from "@/assets/images/roadtrip-hero.png";
import type { PublicTrip } from "@/features/trip-planning/api/public-trips";
import { destinations, landingRoutes, planSteps, valueItems } from "./content";

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="bg-background">
      <div className="page-shell grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14 lg:py-20">
        <div>
          <h1 id="hero-title" className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-secondary">
            Đi đường dài, theo cách của bạn.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-text-sub">
            Lên lịch trình nhiều ngày, thêm điểm dừng, xem tuyến đường và cùng bạn đồng hành chỉnh sửa trên một tấm bản đồ. Dành cho những chuyến đi xe máy, ô tô và xe camper khắp Việt Nam.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={landingRoutes.plan} className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary-strong px-6 text-sm font-bold text-white hover:bg-primary-strong/90">
              Bắt đầu lên kế hoạch <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link href={landingRoutes.explore} className="focus-ring inline-flex min-h-12 items-center justify-center rounded-lg border border-secondary px-6 text-sm font-bold text-secondary hover:bg-background-warm">
              Khám phá lộ trình
            </Link>
          </div>
        </div>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-accent-sub">
          <Image
            src={heroImage}
            alt="Con đường đèo quanh co xuyên qua núi rừng Việt Nam"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}

export function ValueList() {
  return (
    <section aria-labelledby="value-title" className="border-y border-border-main bg-surface">
      <div className="page-shell py-14 sm:py-20">
        <h2 id="value-title" className="max-w-2xl font-display text-3xl font-extrabold tracking-[-0.03em] text-secondary sm:text-4xl">
          Mọi thứ cho một chuyến đi, ở cùng một nơi.
        </h2>
        <ul className="mt-10 grid gap-x-12 sm:grid-cols-2">
          {valueItems.map((item) => (
            <li key={item.title} className="border-t border-border-main py-7">
              <h3 className="text-lg font-extrabold text-text-main">{item.title}</h3>
              <p className="mt-2 max-w-md text-sm leading-7 text-text-sub">{item.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Destinations() {
  return (
    <section id="diem-den" aria-labelledby="destinations-title" className="scroll-mt-4 bg-background">
      <div className="page-shell py-14 sm:py-20">
        <h2 id="destinations-title" className="font-display text-3xl font-extrabold tracking-[-0.03em] text-secondary sm:text-4xl">
          Bắt đầu từ một vùng đất.
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-7 text-text-sub">
          Chọn một điểm đến để xem các lộ trình công khai liên quan.
        </p>
        <ul className="mt-10 grid gap-5 md:grid-cols-6">
          {destinations.map((place) => (
            <li key={place.query} className={place.wide ? "md:col-span-4" : "md:col-span-2"}>
              <Link
                href={`/explore?q=${encodeURIComponent(place.query)}`}
                className="focus-ring group relative block aspect-[4/3] overflow-hidden rounded-2xl bg-accent-sub md:aspect-auto md:h-72"
                aria-label={`Xem lộ trình quanh ${place.name}`}
              >
                <Image
                  src={place.image}
                  alt={place.alt}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 60vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-5 text-white">
                  <span className="block text-xs font-bold uppercase tracking-wide text-white/80">{place.region}</span>
                  <span className="mt-1 block font-display text-2xl font-extrabold">{place.name}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function PlanSteps({ liveTrip }: { liveTrip?: PublicTrip }) {
  return (
    <section id="cach-hoat-dong" aria-labelledby="steps-title" className="scroll-mt-4 border-y border-border-main bg-surface">
      <div className="page-shell grid gap-12 py-14 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
        <div>
          <h2 id="steps-title" className="font-display text-3xl font-extrabold tracking-[-0.03em] text-secondary sm:text-4xl">
            Lên kế hoạch trong ba bước.
          </h2>
          <ol className="mt-10 grid gap-8">
            {planSteps.map((step, index) => (
              <li key={step.title} className="grid grid-cols-[2.5rem_1fr] gap-4">
                <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-strong text-sm font-extrabold text-white">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-lg font-extrabold text-text-main">{step.title}</h3>
                  <p className="mt-2 max-w-lg text-sm leading-7 text-text-sub">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <TripPreview trip={liveTrip} />
      </div>
    </section>
  );
}

function TripPreview({ trip }: { trip?: PublicTrip }) {
  if (!trip) {
    return (
      <aside aria-label="Lộ trình công khai" className="h-fit rounded-2xl border border-dashed border-border-main bg-background p-6">
        <MapPin aria-hidden="true" className="text-primary" size={24} />
        <h3 className="mt-4 text-lg font-extrabold text-text-main">Chưa có lộ trình công khai</h3>
        <p className="mt-2 text-sm leading-7 text-text-sub">
          Khi có chuyến đi được xuất bản, bạn sẽ thấy bản xem trước tại đây và có thể nhân bản về tài khoản của mình.
        </p>
        <Link href={landingRoutes.plan} className="focus-ring mt-5 inline-flex min-h-11 items-center font-bold text-primary underline underline-offset-4">
          Tạo chuyến đi đầu tiên
        </Link>
      </aside>
    );
  }
  return (
    <aside aria-label="Lộ trình công khai mới nhất" className="h-fit rounded-2xl border border-border-main bg-background p-6">
      <p className="text-xs font-bold uppercase tracking-wide text-text-sub">Lộ trình công khai mới nhất</p>
      <h3 className="mt-3 font-display text-2xl font-extrabold text-text-main">{trip.title}</h3>
      {trip.description ? <p className="mt-2 line-clamp-3 text-sm leading-7 text-text-sub">{trip.description}</p> : null}
      <dl className="mt-5 grid gap-2 border-t border-border-main pt-4 text-sm text-text-main">
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-primary" aria-hidden="true" />
          <dt className="sr-only">Thời gian</dt>
          <dd>{trip.startDate} – {trip.endDate}</dd>
        </div>
        <div className="flex items-center gap-2">
          <Wallet size={16} className="text-primary" aria-hidden="true" />
          <dt className="sr-only">Ngân sách dự kiến</dt>
          <dd className="tabular-nums">{trip.budgetAmount.toLocaleString("vi-VN")} {trip.currency}</dd>
        </div>
      </dl>
      <Link href={`/trip/${trip.id}`} className="focus-ring mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary-strong px-5 text-sm font-bold text-white hover:bg-primary-strong/90">
        Xem lộ trình <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </aside>
  );
}
