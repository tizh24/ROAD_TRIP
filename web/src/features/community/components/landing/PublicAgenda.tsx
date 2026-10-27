"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { landingRoutes } from "./content";

export interface AgendaDay {
  id: string;
  dayIndex: number;
  date: string;
  stops: { id: string; name: string; address: string; notes: string | null; stopIndex: number }[];
}

export interface AgendaTrip {
  id: string;
  title: string;
  days: AgendaDay[];
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("vi-VN", { day: "numeric", month: "numeric", timeZone: "UTC" });
}

/** Latest public trip as day tabs and one band per stop. Empty state keeps its frame. */
export default function PublicAgenda({ trip }: { trip: AgendaTrip | null }) {
  const days = trip ? [...trip.days].sort((a, b) => a.dayIndex - b.dayIndex) : [];
  const [selected, setSelected] = useState(0);
  const day = days[selected];

  return (
    <section id="lo-trinh-cong-khai" aria-labelledby="agenda-title" className="scroll-mt-8 py-24 md:py-36">
      <div className="mx-auto w-full max-w-[88rem] px-6 md:px-12">
        <div className="reveal flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h2 id="agenda-title" className="text-[clamp(28px,4vw,56px)] font-medium leading-[1.05] tracking-tight">
            <span className="block text-muted-foreground">Lộ trình công khai</span>
            <span className="block">mới nhất từ cộng đồng.</span>
          </h2>
          <Button asChild size="lg" className="min-h-11 self-start rounded-sm px-5 md:self-auto">
            <Link href={landingRoutes.explore}>Khám phá lộ trình</Link>
          </Button>
        </div>

        {trip && day ? (
          <div className="mt-12 grid gap-4 md:grid-cols-[150px_minmax(0,1fr)] md:gap-10">
            <div role="tablist" aria-label={`Các ngày của ${trip.title}`} className="flex gap-1.5 overflow-x-auto md:flex-col md:overflow-visible">
              {days.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  id={`agenda-tab-${item.id}`}
                  aria-selected={index === selected}
                  aria-controls="agenda-panel"
                  onClick={() => setSelected(index)}
                  className={`focus-ring flex min-h-16 min-w-28 shrink-0 flex-col items-start justify-center rounded-md px-4 text-left transition-colors md:w-[150px] ${index === selected ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-border"}`}
                >
                  <span className="text-base">Ngày {item.dayIndex}</span>
                  <span className="text-sm opacity-80 tabular-nums">{formatDate(item.date)}</span>
                </button>
              ))}
            </div>
            <div id="agenda-panel" role="tabpanel" aria-labelledby={`agenda-tab-${day.id}`}>
              <p className="mb-3 text-sm text-muted-foreground">{trip.title}</p>
              {day.stops.length === 0 ? (
                <p className="rounded-lg bg-muted p-5 text-sm text-muted-foreground">Ngày này chưa có điểm dừng.</p>
              ) : (
                <ol className="grid gap-1">
                  {[...day.stops]
                    .sort((a, b) => a.stopIndex - b.stopIndex)
                    .map((stop, index) => (
                      <li key={stop.id} className={`flex min-h-[76px] items-center gap-5 rounded-lg px-5 py-3 ${index % 2 === 0 ? "bg-muted" : "bg-muted/50"}`}>
                        <span className="w-8 text-xl tabular-nums">{index + 1}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-lg font-medium">{stop.name}</span>
                          <span className="block truncate text-sm text-muted-foreground">{stop.notes || stop.address}</span>
                        </span>
                      </li>
                    ))}
                </ol>
              )}
              <Link href={`/trip/${trip.id}`} className="focus-ring mt-5 inline-flex min-h-11 items-center text-sm font-medium underline underline-offset-4">
                Xem lộ trình này
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-12 flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-10 text-center">
            <h3 className="text-xl font-medium">Chưa có lộ trình công khai</h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              Khi có chuyến đi được xuất bản, bạn sẽ thấy các ngày và điểm dừng của nó tại đây và có thể nhân bản về tài khoản của mình.
            </p>
            <Button asChild className="mt-6 min-h-11">
              <Link href={landingRoutes.plan}>Tạo chuyến đi đầu tiên</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
