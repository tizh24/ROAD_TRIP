import type { CSSProperties, ReactNode } from "react";
import { Search } from "lucide-react";
import { emergencyNumbers, sampleTrip } from "./content";
import { Fragment, StopRow } from "./Fragments";

function Exchange({ order, children, call, wide = false, index }: { order: string; children: ReactNode; call: ReactNode; wide?: boolean; index: number }) {
  return (
    <div className="reveal" style={{ "--i": index } as CSSProperties}>
      <p className="text-xl font-medium">{order}</p>
      <div className="mt-4 rounded-lg bg-muted p-5">{call}</div>
      <div className={`mt-6 md:pl-14 ${wide ? "lg:-mr-[200px]" : ""}`}>{children}</div>
    </div>
  );
}

/** Three exchanges: what the traveler gives, and the fragment Tripz returns. */
export default function HowItWorks() {
  const [first, second, third, fourth, fifth] = sampleTrip.stops;
  return (
    <section id="cach-hoat-dong" aria-labelledby="how-title" className="scroll-mt-8 py-24 md:py-36">
      <div className="mx-auto w-full max-w-[88rem] px-6 md:px-12">
        <div className="max-w-[560px] md:ml-[27%]">
          <h2 id="how-title" className="reveal text-[28px] font-medium leading-tight tracking-tight">
            Từ ý tưởng đến chặng đầu tiên.
          </h2>
          <div className="mt-14 space-y-[88px]">
            <Exchange
              index={0}
              order="Đầu tiên, tìm nơi bạn muốn đến."
              call={
                <div data-ui className="flex min-h-11 items-center gap-3 rounded-md border border-border bg-card px-3 text-sm">
                  <Search className="size-4 text-muted-foreground" aria-hidden="true" />
                  <span>Mã Pí Lèng</span>
                </div>
              }
            >
              <Fragment className="p-2">
                <ul>
                  <StopRow index={1} name="Đèo Mã Pí Lèng" detail="Mèo Vạc, Hà Giang" active />
                </ul>
                <p className="px-3 py-2 text-sm text-muted-foreground">Chọn một kết quả để thêm vào ngày bạn muốn.</p>
              </Fragment>
            </Exchange>

            <Exchange
              index={0}
              order="Rồi chia các điểm dừng theo ngày."
              call={
                <div data-ui className="flex min-h-11 items-center rounded-md border border-border bg-card px-3 text-sm">
                  Chuyển {fourth.name} sang Ngày 2
                </div>
              }
            >
              <Fragment className="p-2">
                <p className="px-3 pt-1 text-sm font-medium">Ngày 1</p>
                <ol>
                  <StopRow index={1} name={first.name} detail="Xuất phát" />
                  <StopRow index={2} name={second.name} detail={`${second.legKm} km`} />
                  <StopRow index={3} name={third.name} detail={`${third.legKm} km`} />
                </ol>
                <p className="px-3 pt-2 text-sm font-medium">Ngày 2</p>
                <ol>
                  <StopRow index={4} name={fourth.name} detail={`${fourth.legKm} km`} active />
                  <StopRow index={5} name={fifth.name} detail={`${fifth.legKm} km`} />
                </ol>
              </Fragment>
            </Exchange>

            <Exchange
              index={0}
              wide
              order="Cuối cùng, mở chế độ đi đường."
              call={
                <div data-ui className="flex min-h-11 items-center rounded-md border border-border bg-card px-3 text-sm">
                  Mở chế độ đi đường
                </div>
              }
            >
              <Fragment className="p-4">
                <p className="text-sm text-muted-foreground">Chặng tiếp theo</p>
                <p className="mt-1 text-xl font-semibold">{fourth.name}</p>
                <p className="text-sm tabular-nums text-muted-foreground">{fourth.legKm} km từ {third.name}</p>
                <ul className="mt-4 grid gap-2 sm:grid-cols-3">
                  {emergencyNumbers.map((item) => (
                    <li key={item.number}>
                      <a
                        href={`tel:${item.number}`}
                        className="focus-ring flex min-h-11 items-center justify-between rounded-md bg-muted px-3 text-sm hover:bg-border"
                      >
                        <span>{item.label}</span>
                        <span className="font-medium tabular-nums">{item.number}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </Fragment>
            </Exchange>
          </div>
        </div>
      </div>
    </section>
  );
}
