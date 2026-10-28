import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { landingRoutes } from "./content";
import { HeroPeek } from "./Fragments";

/** First screen: everything hangs on one alignment 27% in from the left; the right half is blank on purpose. */
export default function Hero() {
  return (
    <section aria-labelledby="hero-title" className="flex min-h-[640px] flex-col overflow-hidden md:min-h-[720px] lg:min-h-svh">
      <div className="mx-auto flex w-full max-w-[88rem] flex-1 flex-col px-6 md:px-12">
        <div className="pt-[28svh] md:ml-[27%] md:max-w-[380px] md:pt-[220px]">
          <h1 id="hero-title" className="text-[28px] font-medium leading-tight tracking-tight">
            Lên lịch cả chuyến đi
            <br />
            trên một tấm bản đồ.
          </h1>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground">
            Thêm điểm dừng, chia theo ngày và cùng bạn đồng hành chỉnh sửa. Dành cho xe máy, ô tô và camper khắp Việt Nam.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Button asChild size="lg" className="min-h-11 rounded-sm px-5">
              <Link href={landingRoutes.plan}>Bắt đầu lên kế hoạch</Link>
            </Button>
            <Link
              href={landingRoutes.explore}
              className="focus-ring inline-flex min-h-11 items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
            >
              Khám phá lộ trình <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="mt-auto md:ml-[27%]">
          <div className="h-[156px] overflow-hidden pt-10 md:h-[104px] md:pt-0">
            <HeroPeek />
          </div>
        </div>
      </div>
    </section>
  );
}
