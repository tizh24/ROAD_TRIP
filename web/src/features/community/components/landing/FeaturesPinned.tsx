"use client";

import { useId, useState, type CSSProperties, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Fragment, StopRow } from "./Fragments";

type Access = "view" | "edit";
type Visibility = "private" | "link" | "public";

const accessOptions = [
  { id: "view", label: "Chỉ xem" },
  { id: "edit", label: "Được chỉnh sửa" },
] as const;
const visibilityOptions = [
  { id: "private", label: "Riêng tư" },
  { id: "link", label: "Qua liên kết" },
  { id: "public", label: "Công khai" },
] as const;
const visibilityText: Record<Visibility, string> = {
  private: "Chỉ bạn và bạn đồng hành",
  link: "Ai có liên kết đều xem được",
  public: "Hiển thị với cộng đồng",
};

const baseStops = ["Đồng Văn", "Yên Minh", "Mèo Vạc"];
const plannedBudget = 3_000_000;
const baseExpenses = 1_250_000;
const money = (value: number) => `${value.toLocaleString("vi-VN")} đ`;

function Choice<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { id: T; label: string }[];
  onChange: (id: T) => void;
}) {
  const name = useId();
  return (
    <fieldset className="mt-6">
      <legend className="sr-only">{label}</legend>
      <div className="inline-flex flex-wrap rounded-md bg-muted p-0.5">
        {options.map((option) => (
          <label
            key={option.id}
            className="flex min-h-11 cursor-pointer items-center rounded px-4 text-sm text-muted-foreground has-[:checked]:bg-card has-[:checked]:font-medium has-[:checked]:text-foreground has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring"
          >
            <input type="radio" name={name} value={option.id} checked={value === option.id} onChange={() => onChange(option.id)} className="sr-only" />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Block({ title, text, children, index }: { title: string; text: string; children: ReactNode; index: number }) {
  return (
    <div className="reveal flex min-h-[50svh] flex-col justify-center py-10" style={{ "--i": index } as CSSProperties}>
      <h3 className="text-[28px] font-medium leading-tight tracking-tight">{title}</h3>
      <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">{text}</p>
      {children}
    </div>
  );
}

/** The trip sheet stays fixed while the reader operates the controls beside it. */
export default function FeaturesPinned() {
  const [access, setAccess] = useState<Access>("view");
  const [swapped, setSwapped] = useState(false);
  const [extra, setExtra] = useState(0);
  const [draft, setDraft] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("private");
  const expenseId = useId();

  const stops = swapped ? [baseStops[1], baseStops[0], baseStops[2]] : baseStops;
  const spent = baseExpenses + extra;

  function addExpense() {
    const amount = Number(draft.replace(/\D/g, ""));
    if (!amount) return;
    setExtra((value) => value + amount);
    setDraft("");
  }

  return (
    <section aria-labelledby="features-title" className="bg-background">
      <div className="flex w-full flex-col lg:grid lg:grid-cols-2">
        <div className="sticky top-0 z-10 flex h-[42svh] items-center justify-center overflow-hidden bg-muted px-6 lg:h-svh">
          <Fragment className="w-full max-w-[420px] p-4" >
            <div aria-live="polite">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Chuyến đi mẫu</p>
                  <p className="text-lg font-semibold">Hà Giang, cao nguyên đá</p>
                </div>
                <span className="rounded-md bg-muted px-2 py-1 text-xs">{visibilityOptions.find((o) => o.id === visibility)?.label}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{visibilityText[visibility]}</p>
              <ol className="mt-4">
                {stops.map((name, index) => (
                  <StopRow key={name} index={index + 1} name={name} detail={index === 0 ? "Ngày 1" : "Ngày 2"} />
                ))}
              </ol>
              <div className="mt-3 flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm">
                <span>Bạn đồng hành</span>
                <span className="font-medium">{access === "edit" ? "Được chỉnh sửa" : "Chỉ xem"}</span>
              </div>
              <dl className="mt-3 flex justify-between px-1 text-sm">
                <div>
                  <dt className="text-muted-foreground">Đã chi</dt>
                  <dd className="tabular-nums">{money(spent)}</dd>
                </div>
                <div className="text-right">
                  <dt className="text-muted-foreground">Ngân sách dự kiến</dt>
                  <dd className="tabular-nums">{money(plannedBudget)}</dd>
                </div>
              </dl>
            </div>
          </Fragment>
        </div>

        <div className="px-6 pb-16 pt-12 md:px-12 lg:pb-[10svh] lg:pt-[72px]">
          <div className="max-w-[44ch]">
            <h2 id="features-title" className="text-[44px] font-medium leading-[1.05] tracking-tight">
              Cùng chỉnh lịch trình.
            </h2>
            <Block index={0} title="Mời bạn đồng hành, chọn quyền của họ." text="Mời bằng email với quyền chỉ xem hoặc được chỉnh sửa. Chủ chuyến đi luôn kiểm soát ai được làm gì.">
              <Choice label="Quyền của bạn đồng hành" value={access} options={accessOptions} onChange={setAccess} />
            </Block>
            <Block index={0} title="Đổi thứ tự điểm dừng bất cứ lúc nào." text="Thêm ghi chú, đổi thứ tự hoặc chuyển điểm dừng sang ngày khác. Mỗi thay đổi đều có trạng thái lưu rõ ràng.">
              <Button variant="outline" className="mt-6 min-h-11 self-start" onClick={() => setSwapped((v) => !v)} aria-pressed={swapped}>
                {swapped ? "Trả Yên Minh về sau Đồng Văn" : "Đưa Yên Minh lên trước Đồng Văn"}
              </Button>
            </Block>
            <Block index={0} title="Ghi lại chi tiêu của chuyến đi." text="Ghi từng khoản chi trong chuyến và xem tổng cộng so với ngân sách bạn đã đặt.">
              <form
                className="mt-6 flex max-w-sm gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  addExpense();
                }}
              >
                <label htmlFor={expenseId} className="sr-only">Số tiền khoản chi (đồng)</label>
                <Input id={expenseId} inputMode="numeric" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="150000" className="h-11" />
                <Button type="submit" className="min-h-11">Thêm khoản chi</Button>
              </form>
            </Block>
            <Block index={0} title="Chọn ai được xem chuyến đi." text="Giữ riêng tư, chia sẻ qua liên kết hoặc công khai để cộng đồng có thể xem và nhân bản.">
              <Choice label="Chế độ chia sẻ" value={visibility} options={visibilityOptions} onChange={setVisibility} />
            </Block>
          </div>
        </div>
      </div>
    </section>
  );
}
