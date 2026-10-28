"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { destinations, photoCredits } from "./content";

const creditByIndex = [photoCredits[0], photoCredits[1], photoCredits[2], photoCredits[3]];
const HOLD_MS = 6000;

/** One framed photograph that slowly crossfades between places; the list beside it selects and links. */
export default function Destinations() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (paused || reduced) return;
    const id = window.setInterval(() => {
      if (!document.hidden) setActive((value) => (value + 1) % destinations.length);
    }, HOLD_MS);
    return () => window.clearInterval(id);
  }, [paused, reduced]);

  const current = destinations[active];
  const credit = creditByIndex[active];

  return (
    <section id="diem-den" aria-labelledby="destinations-title" className="scroll-mt-8 py-24 md:py-36">
      <div className="mx-auto w-full max-w-[88rem] px-6 md:px-12">
        <div className="reveal max-w-2xl">
          <h2 id="destinations-title" className="text-[28px] font-medium leading-tight tracking-tight">
            Bắt đầu từ một vùng đất.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Chọn một nơi để xem các lộ trình công khai đi qua đó, rồi nhân bản về tài khoản của bạn.
          </p>
        </div>

        <div
          className="mt-12 grid gap-8 lg:grid-cols-[7fr_5fr] lg:gap-16"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          <figure className="reveal" style={{ "--i": 1 } as React.CSSProperties}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
              {destinations.map((place, index) => (
                <Image
                  key={place.id}
                  src={place.image}
                  alt={place.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  priority={index === 0}
                  className={`object-cover transition-opacity duration-[1600ms] ease-in-out motion-reduce:transition-none ${index === active ? "opacity-100" : "opacity-0"}`}
                  aria-hidden={index === active ? undefined : true}
                />
              ))}
            </div>
            <figcaption className="mt-3 flex flex-wrap justify-between gap-x-4 text-sm text-muted-foreground">
              <span>{current.name}, {current.region}</span>
              <span>Ảnh: {credit.creator}, {credit.licence}</span>
            </figcaption>
          </figure>

          <ul className="reveal self-center" style={{ "--i": 2 } as React.CSSProperties}>
            {destinations.map((place, index) => (
              <li key={place.id}>
                <Link
                  href={`/explore?q=${encodeURIComponent(place.query)}`}
                  aria-label={`Xem lộ trình quanh ${place.name}`}
                  onMouseEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                  className={`focus-ring flex min-h-16 items-center justify-between gap-4 rounded-md px-4 py-3 transition-colors ${index === active ? "bg-muted" : "hover:bg-muted/60"}`}
                >
                  <span>
                    <span className="block text-xl font-medium">{place.name}</span>
                    <span className="block text-sm text-muted-foreground">{place.region}</span>
                  </span>
                  <ArrowRight className="size-5 shrink-0" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
