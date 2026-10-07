"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { cloneElement, FormEvent, useRef, useState, type ReactElement } from "react";
import { GatewayApiError } from "@/features/trip-planning/api/gateway-request";
import { createTrip } from "@/features/trip-planning/api/trips";
import { createTripInputSchema } from "@/features/trip-planning/api/trip-model";
import { trackAnalytics } from "@/lib/analytics/analytics";
import FeedbackState from "@/components/ui/FeedbackState";
import { ArrowRight, CalendarDays, Wallet } from "lucide-react";

type FormValues = { title: string; description: string; startDate: string; endDate: string; budgetAmount: string };
type FieldErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = { title: "", description: "", startDate: "", endDate: "", budgetAmount: "" };

export default function CreateTripForm() {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const idempotencyKey = useRef<string | undefined>(undefined);

  function update(name: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    const parsed = createTripInputSchema.safeParse({
      title: values.title,
      description: values.description || null,
      startDate: values.startDate,
      endDate: values.endDate,
      budgetAmount: values.budgetAmount === "" ? 0 : Number(values.budgetAmount),
      currency: "VND",
    });
    if (!parsed.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string" && field in values) nextErrors[field as keyof FormValues] ??= issue.message;
      }
      setErrors(nextErrors);
      return;
    }

    setSubmitError(undefined);
    setIsSubmitting(true);
    idempotencyKey.current ??= crypto.randomUUID();
    const mutationKey = idempotencyKey.current;
    trackAnalytics("trip_creation_started", {}, { dedupeKey: mutationKey });
    try {
      const trip = await createTrip(parsed.data, mutationKey);
      const dayCount = Math.round((Date.parse(`${parsed.data.endDate}T00:00:00Z`) - Date.parse(`${parsed.data.startDate}T00:00:00Z`)) / 86_400_000) + 1;
      trackAnalytics("trip_created", { dayCount }, { dedupeKey: mutationKey });
      router.replace(`/trips/${trip.id}`);
    } catch (error) {
      setSubmitError(error instanceof GatewayApiError ? error.message : "Không thể tạo chuyến đi. Vui lòng thử lại.");
      setIsSubmitting(false);
    }
  }

  return <main className="min-h-screen bg-background px-4 py-8 sm:px-6 sm:py-12"><div className="page-shell max-w-6xl px-0"><nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm"><Link href="/trips" className="focus-ring font-bold text-primary hover:underline">Chuyến đi của tôi</Link><span className="text-text-sub">/</span><span className="text-text-sub">Khởi tạo hành trình mới</span></nav><header className="mt-8 border-b border-border-main pb-7"><p className="text-xs font-extrabold uppercase tracking-[.16em] text-primary">Tạo chuyến đi mới</p><h1 className="mt-3 text-4xl font-extrabold tracking-[-.04em] sm:text-5xl">Khởi tạo hành trình mới.</h1><ol className="mt-7 grid gap-3 sm:grid-cols-3" aria-label="Các bước tạo chuyến đi"><li className="rounded-xl border border-primary bg-primary-fixed px-4 py-3 text-sm font-bold text-primary"><span className="mr-2 text-xs">Bước 1</span>Thông tin cơ bản</li><li className="rounded-xl bg-surface-container-low px-4 py-3 text-sm font-bold text-text-sub"><span className="mr-2 text-xs">Bước 2</span>Thiết lập tuyến đường</li><li className="rounded-xl bg-surface-container-low px-4 py-3 text-sm font-bold text-text-sub"><span className="mr-2 text-xs">Bước 3</span>Mời bạn đồng hành</li></ol></header><form onSubmit={onSubmit} className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]" noValidate><div className="rounded-panel bg-white p-6 shadow-card sm:p-8"><div className="mb-8 flex items-start gap-3 border-b border-border-light pb-5"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white"><CalendarDays size={19} /></div><div><h2 className="font-extrabold">Chi tiết chuyến đi</h2><p className="mt-1 text-sm text-text-sub">Điền những thông tin cần thiết trước khi lập tuyến.</p></div></div><div className="space-y-7">{submitError && <FeedbackState kind="error" title="Không thể tạo chuyến đi" description={submitError} actionLabel="Thử lại" onAction={() => setSubmitError(undefined)} />}<Field name="title" label="Tên chuyến đi *" error={errors.title}><input id="title" required value={values.title} onChange={(event) => update("title", event.target.value)} className="field mt-2" placeholder="Ví dụ: Hà Giang đầu mùa mây" aria-invalid={Boolean(errors.title)} /></Field><Field name="description" label="Mô tả chuyến đi" error={errors.description}><textarea id="description" value={values.description} onChange={(event) => update("description", event.target.value)} className="field mt-2 min-h-28" placeholder="Bạn muốn nhớ điều gì về chuyến đi này?" /></Field><div className="rounded-xl bg-surface-container-low p-4"><p className="text-xs font-bold uppercase tracking-[.12em] text-text-sub">Thiết lập tuyến đường</p><div className="mt-3 grid gap-2 sm:grid-cols-2"><div className="rounded-lg bg-white p-3 text-sm"><span className="block text-xs text-text-sub">Điểm xuất phát</span><span className="mt-1 block font-bold">Thêm sau khi tạo</span></div><div className="rounded-lg bg-white p-3 text-sm"><span className="block text-xs text-text-sub">Điểm kết thúc</span><span className="mt-1 block font-bold">Thêm sau khi tạo</span></div></div></div><div className="grid gap-5 sm:grid-cols-2"><Field name="startDate" label="Khởi hành" error={errors.startDate}><input id="startDate" required type="date" value={values.startDate} onChange={(event) => update("startDate", event.target.value)} className="field mt-2" /></Field><Field name="endDate" label="Kết thúc" error={errors.endDate}><input id="endDate" required type="date" value={values.endDate} onChange={(event) => update("endDate", event.target.value)} className="field mt-2" /></Field></div><Field name="budgetAmount" label="Ngân sách dự kiến mỗi người (VND)" error={errors.budgetAmount}><input id="budgetAmount" type="number" min="0" step="1000" inputMode="numeric" value={values.budgetAmount} onChange={(event) => update("budgetAmount", event.target.value)} className="field mt-2" placeholder="0" /></Field></div><div className="mt-8 flex flex-col-reverse gap-3 border-t border-border-light pt-6 sm:flex-row sm:justify-end"><Link href="/trips" className="focus-ring rounded-lg px-4 py-3 text-center text-sm font-bold text-text-sub">Lưu bản nháp</Link><button disabled={isSubmitting} className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white shadow-card hover:bg-primary-hover disabled:opacity-60">{isSubmitting ? "Đang tạo…" : "Tạo và tiếp tục"}<ArrowRight size={16} /></button></div></div><aside className="space-y-4"><div className="rounded-panel bg-secondary p-6 text-white shadow-card"><CalendarDays className="text-amber-200" /><h2 className="mt-5 text-xl font-extrabold">Xem trước lịch trình.</h2><p className="mt-3 text-sm leading-6 text-white/75">Ngày đi và ngân sách giúp nhóm cùng nhìn một kế hoạch. Mọi điểm dừng đều có thể thêm sau.</p><div className="mt-6 border-t border-white/15 pt-5"><Wallet size={17} className="text-amber-200" /><p className="mt-2 text-xs font-bold uppercase tracking-[.13em] text-white/60">Dự toán</p><p className="mt-1 text-sm text-white/80">Chi phí có thể cập nhật trong planner.</p></div></div><div className="rounded-panel bg-surface-container-low p-5"><p className="text-sm font-extrabold">Mẹo hành trình</p><p className="mt-2 text-sm leading-6 text-text-sub">Chọn ngày thực tế để TripZ phân bổ từng chặng lái xe hợp lý.</p></div></aside></form></div></main>;
}

function Field({ name, label, error, children }: { name: string; label: string; error?: string; children: ReactElement<Record<string, unknown>> }) { const control = name === "description" ? cloneElement(children, { "aria-label": "Mô tả" }) : children; return <div><label htmlFor={name} className="block text-sm font-bold text-text-main">{label}</label><div className="mt-2">{control}</div>{error && <p id={`${name}-error`} role="alert" className="mt-1 text-sm font-medium text-danger">{error}</p>}</div>; }
