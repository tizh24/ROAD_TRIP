import type { ReactNode } from "react";
import { MousePointer2 } from "lucide-react";
import { sampleTrip } from "./content";

/** A cropped piece of the product's own interface. `data-ui` marks it as an interface fragment, not page chrome. */
export function Fragment({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div data-ui className={`rounded-lg border border-border bg-card text-card-foreground ${className}`}>
      {children}
    </div>
  );
}

export function StopRow({ index, name, detail, active = false }: { index: number; name: string; detail: string; active?: boolean }) {
  return (
    <li
      className={`flex min-h-12 items-center gap-3 rounded-md px-3 text-sm ${active ? "bg-muted" : ""}`}
    >
      <span className="w-5 text-muted-foreground tabular-nums">{index}</span>
      <span className="flex-1 truncate font-medium">{name}</span>
      <span className="text-muted-foreground tabular-nums">{detail}</span>
    </li>
  );
}

/** The two rows that peek in at the foot of the first screen. */
export function HeroPeek() {
  const [from, to, next] = sampleTrip.stops;
  return (
    <Fragment className="relative w-full bg-muted p-2 md:w-[368px]">
      <p className="px-3 pb-1 pt-1 text-sm text-muted-foreground">Chuyến đi mẫu · Ngày 1</p>
      <ol>
        <StopRow index={1} name={from.name} detail="Xuất phát" />
        <StopRow index={2} name={to.name} detail={`${to.legKm} km`} active />
        <StopRow index={3} name={next.name} detail={`${next.legKm} km`} />
      </ol>
      <MousePointer2
        className="pointer-events-none absolute right-24 top-[88px] size-5 fill-foreground text-card"
        aria-hidden="true"
      />
    </Fragment>
  );
}
