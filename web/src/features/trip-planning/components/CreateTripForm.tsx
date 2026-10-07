"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";
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

  return <main className="min-h-screen bg-background px-4 py-8 sm:px-6 sm:py-12"><div className="page-shell max-w-5xl px-0"><Link href="/trips" className="focus-ring text-sm font-bold text-primary hover:underline">← Chuyến đi của bạn</Link><header className="mt-7 grid gap-6 border-b border-border-main pb-8 lg:grid-cols-[1fr_auto] lg:items-end"><div><p className="text-xs font-extrabold uppercase tracking-[.16em] text-primary">Bắt đầu hành trình</p><h1 className="mt-3 text-4xl font-extrabold tracking-[-.04em] sm:text-5xl">Một chuyến đi mới<br />bắt đầu từ ý tưởng.</h1><p className="mt-4 max-w-xl text-sm leading-6 text-text-sub">Điền những điều thiết yếu trước. Sau khi tạo, bạn sẽ thêm điểm dừng và xây lộ trình trên bản đồ.</p></div><ol className="flex gap-2 text-xs font-bold text-text-sub" aria-label="Các bước tạo chuyến đi"><li className="rounded-lg bg-secondary px-3 py-2 text-white">1 · Ý tưởng</li><li className="rounded-lg bg-surface px-3 py-2">2 · Thời gian</li><li className="rounded-lg bg-surface px-3 py-2">3 · Ngân sách</li></ol></header><form onSubmit={onSubmit} className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_17rem]" noValidate><div className="surface-card space-y-7 p-6 sm:p-8">{submitError && <FeedbackState kind="error" title="Không thể tạo chuyến đi" description={submitError} actionLabel="Thử lại" onAction={() => setSubmitError(undefined)} />}<Field name="title" label="Tên chuyến đi" error={errors.title}><input id="title" required value={values.title} onChange={(event) => update("title", event.target.value)} className="field mt-2" placeholder="Ví dụ: Hà Giang đầu mùa mây" aria-invalid={Boolean(errors.title)} /></Field><Field name="description" label="Bạn muốn nhớ điều gì về chuyến đi này?" error={errors.description}><textarea id="description" value={values.description} onChange={(event) => update("description", event.target.value)} className="field mt-2 min-h-28" placeholder="Một vài dòng ngắn là đủ…" /></Field><div className="grid gap-5 sm:grid-cols-2"><Field name="startDate" label="Ngày bắt đầu" error={errors.startDate}><input id="startDate" required type="date" value={values.startDate} onChange={(event) => update("startDate", event.target.value)} className="field mt-2" /></Field><Field name="endDate" label="Ngày kết thúc" error={errors.endDate}><input id="endDate" required type="date" value={values.endDate} onChange={(event) => update("endDate", event.target.value)} className="field mt-2" /></Field></div><Field name="budgetAmount" label="Ngân sách dự kiến (VND)" error={errors.budgetAmount}><input id="budgetAmount" type="number" min="0" step="1000" inputMode="numeric" value={values.budgetAmount} onChange={(event) => update("budgetAmount", event.target.value)} className="field mt-2" placeholder="0" /></Field><div className="flex flex-col-reverse gap-3 border-t border-border-light pt-6 sm:flex-row sm:justify-end"><Link href="/trips" className="focus-ring rounded-lg px-4 py-3 text-center text-sm font-bold text-text-sub">Hủy</Link><button disabled={isSubmitting} className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white shadow-card hover:bg-primary-hover disabled:opacity-60">{isSubmitting ? "Đang tạo…" : "Tạo hành trình"}<ArrowRight size={16} /></button></div></div><aside className="h-fit rounded-panel bg-secondary p-6 text-white shadow-card"><CalendarDays className="text-amber-200" /><h2 className="mt-5 text-xl font-extrabold">Đủ để bắt đầu.</h2><p className="mt-3 text-sm leading-6 text-white/75">Ngày đi và ngân sách giúp nhóm cùng nhìn một kế hoạch. Mọi điểm dừng đều có thể thêm sau.</p><div className="mt-6 border-t border-white/15 pt-5"><Wallet size={17} className="text-amber-200" /><p className="mt-2 text-xs font-bold uppercase tracking-[.13em] text-white/60">Lưu ý</p><p className="mt-1 text-sm text-white/80">Bạn có thể chỉnh sửa toàn bộ sau khi tạo.</p></div></aside></form></div></main>;
}

function Field({ name, label, error, children }: { name: string; label: string; error?: string; children: React.ReactNode }) { return <div><label htmlFor={name} className="block text-sm font-bold text-text-main">{label}</label><div className="mt-2">{children}</div>{error && <p id={`${name}-error`} role="alert" className="mt-1 text-sm font-medium text-danger">{error}</p>}</div>; }
