"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";
import { GatewayApiError } from "@/features/trip-planning/api/gateway-request";
import { createTrip } from "@/features/trip-planning/api/trips";
import { createTripInputSchema } from "@/features/trip-planning/api/trip-model";
import { trackAnalytics } from "@/lib/analytics/analytics";

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

  return <section className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-14"><Link href="/trips" className="text-sm font-bold text-primary hover:underline">← Chuyến đi của bạn</Link><h1 className="mt-5 text-h1 text-gray-900">Tạo chuyến đi mới</h1><p className="mt-3 text-gray-600">Nhập thông tin cơ bản. Bạn có thể thêm các điểm dừng ngay sau đó.</p><form onSubmit={onSubmit} className="mt-8 space-y-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-card sm:p-6" noValidate>{submitError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{submitError}</p>}<Field name="title" label="Tên chuyến đi" error={errors.title}><input id="title" required value={values.title} onChange={(event) => update("title", event.target.value)} className="field" aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? "title-error" : undefined} /></Field><Field name="description" label="Mô tả" error={errors.description}><textarea id="description" value={values.description} onChange={(event) => update("description", event.target.value)} className="field min-h-28" aria-describedby={errors.description ? "description-error" : undefined} /></Field><div className="grid gap-6 sm:grid-cols-2"><Field name="startDate" label="Ngày bắt đầu" error={errors.startDate}><input id="startDate" required type="date" value={values.startDate} onChange={(event) => update("startDate", event.target.value)} className="field" aria-invalid={Boolean(errors.startDate)} aria-describedby={errors.startDate ? "startDate-error" : undefined} /></Field><Field name="endDate" label="Ngày kết thúc" error={errors.endDate}><input id="endDate" required type="date" value={values.endDate} onChange={(event) => update("endDate", event.target.value)} className="field" aria-invalid={Boolean(errors.endDate)} aria-describedby={errors.endDate ? "endDate-error" : undefined} /></Field></div><Field name="budgetAmount" label="Ngân sách dự kiến (VND)" error={errors.budgetAmount}><input id="budgetAmount" type="number" min="0" step="1000" inputMode="numeric" value={values.budgetAmount} onChange={(event) => update("budgetAmount", event.target.value)} className="field" aria-invalid={Boolean(errors.budgetAmount)} aria-describedby={errors.budgetAmount ? "budgetAmount-error" : undefined} /></Field><div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end"><Link href="/trips" className="rounded-xl px-4 py-3 text-center text-sm font-bold text-gray-700 hover:bg-gray-100">Hủy</Link><button disabled={isSubmitting} className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? "Đang tạo…" : "Tạo và tiếp tục"}</button></div></form></section>;
}

function Field({ name, label, error, children }: { name: string; label: string; error?: string; children: React.ReactNode }) {
  return <div><label htmlFor={name} className="block text-sm font-bold text-gray-800">{label}</label><div className="mt-2">{children}</div>{error && <p id={`${name}-error`} role="alert" className="mt-1 text-sm font-medium text-red-700">{error}</p>}</div>;
}
