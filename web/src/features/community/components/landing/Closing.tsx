import Link from "next/link";
import { landingRoutes } from "./content";

/** The sentence has a gap, and the gap is the form: a GET search into the public routes. */
export default function Closing() {
  return (
    <section aria-labelledby="closing-title" className="py-24 md:py-36">
      <div className="mx-auto w-full max-w-[88rem] px-6 md:px-12">
        <form action={landingRoutes.explore} method="get" className="reveal text-[clamp(28px,5vw,56px)] leading-[1.1] tracking-tight">
          <div className="flex flex-wrap items-baseline gap-x-[0.3em] gap-y-[0.25em]">
            <h2 id="closing-title" className="font-medium">Bạn muốn đi qua đâu?</h2>
            <label htmlFor="closing-q" className="sr-only">Địa điểm</label>
            <input
              id="closing-q"
              name="q"
              placeholder="Sa Pa"
              autoComplete="off"
              className="h-[1.5em] w-[7em] rounded-sm bg-muted px-[0.4em] font-normal placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring"
            />
            <button
              type="submit"
              className="focus-ring h-[1.5em] rounded-sm bg-primary px-[0.5em] font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Tìm
            </button>
          </div>
        </form>
        <p className="reveal mt-6 max-w-xl text-base leading-relaxed text-muted-foreground" style={{ "--i": 1 } as React.CSSProperties}>
          Kết quả là các lộ trình công khai do cộng đồng chia sẻ; bạn có thể nhân bản một lộ trình về tài khoản của mình.
          Muốn tự lập?{" "}
          <Link href={landingRoutes.plan} className="font-medium text-foreground underline underline-offset-4">
            Bắt đầu lên kế hoạch
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
