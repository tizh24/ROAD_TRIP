"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { cloneElement, FormEvent, useRef, useState, type ReactElement } from "react";
import { GatewayApiError } from "@/features/trip-planning/api/gateway-request";
import { createTrip } from "@/features/trip-planning/api/trips";
import { createTripInputSchema } from "@/features/trip-planning/api/trip-model";
import { trackAnalytics } from "@/lib/analytics/analytics";
import FeedbackState from "@/components/ui/FeedbackState";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
      router.replace(`/planner/${trip.id}`);
    } catch (error) {
      setSubmitError(error instanceof GatewayApiError ? error.message : "Không thể tạo chuyến đi. Vui lòng thử lại.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page-shell max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/trips" className="focus-ring rounded underline-offset-4 hover:text-foreground hover:underline">
          Chuyến đi của tôi
        </Link>
        <span aria-hidden="true">/</span>
        <span>Khởi tạo hành trình mới</span>
      </nav>

      <header className="mt-8">
        <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">Khởi tạo hành trình mới.</h1>
        <ol className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm" aria-label="Các bước tạo chuyến đi">
          <li aria-current="step" className="font-medium">
            <span className="mr-2 tabular-nums">1</span>Thông tin cơ bản
          </li>
          <li className="text-muted-foreground">
            <span className="mr-2 tabular-nums">2</span>Thiết lập tuyến đường
          </li>
          <li className="text-muted-foreground">
            <span className="mr-2 tabular-nums">3</span>Mời bạn đồng hành
          </li>
        </ol>
      </header>

      <form onSubmit={onSubmit} className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]" noValidate>
        <div>
          <div className="space-y-6">
            {submitError && (
              <FeedbackState kind="error" title="Không thể tạo chuyến đi" description={submitError} actionLabel="Thử lại" onAction={() => setSubmitError(undefined)} />
            )}
            <Field name="title" label="Tên chuyến đi *" error={errors.title}>
              <Input id="title" required value={values.title} onChange={(event) => update("title", event.target.value)} className="h-11" placeholder="Ví dụ: Hà Giang đầu mùa mây" aria-invalid={Boolean(errors.title)} />
            </Field>
            <Field name="description" label="Mô tả chuyến đi" error={errors.description}>
              <Textarea id="description" value={values.description} onChange={(event) => update("description", event.target.value)} className="min-h-28" placeholder="Bạn muốn nhớ điều gì về chuyến đi này?" />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field name="startDate" label="Khởi hành" error={errors.startDate}>
                <Input id="startDate" required type="date" value={values.startDate} onChange={(event) => update("startDate", event.target.value)} className="h-11" aria-invalid={Boolean(errors.startDate)} />
              </Field>
              <Field name="endDate" label="Kết thúc" error={errors.endDate}>
                <Input id="endDate" required type="date" value={values.endDate} onChange={(event) => update("endDate", event.target.value)} className="h-11" aria-invalid={Boolean(errors.endDate)} />
              </Field>
            </div>
            <Field name="budgetAmount" label="Ngân sách dự kiến mỗi người (VND)" error={errors.budgetAmount}>
              <Input id="budgetAmount" type="number" min="0" step="1000" inputMode="numeric" value={values.budgetAmount} onChange={(event) => update("budgetAmount", event.target.value)} className="h-11" placeholder="0" aria-invalid={Boolean(errors.budgetAmount)} />
            </Field>
          </div>
          <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button asChild variant="ghost" className="min-h-11">
              <Link href="/trips">Lưu bản nháp</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-h-11">
              {isSubmitting ? "Đang tạo…" : "Tạo và tiếp tục"}
              <ArrowRight aria-hidden="true" />
            </Button>
          </div>
        </div>

        <aside className="h-fit rounded-xl bg-muted p-6 text-sm leading-relaxed lg:sticky lg:top-6">
          <h2 className="text-base font-medium">Điểm dừng thêm sau.</h2>
          <p className="mt-2 text-muted-foreground">
            Ngày đi và ngân sách giúp cả nhóm nhìn cùng một kế hoạch. Điểm xuất phát, điểm kết thúc và các điểm dừng được thêm trong planner sau khi tạo.
          </p>
          <p className="mt-4 text-muted-foreground">Chọn ngày thực tế để Tripz chia các chặng lái xe hợp lý.</p>
        </aside>
      </form>
    </div>
  );
}

function Field({ name, label, error, children }: { name: string; label: string; error?: string; children: ReactElement<Record<string, unknown>> }) {
  const labels: Record<string, string> = { description: "Mô tả", startDate: "Ngày bắt đầu", endDate: "Ngày kết thúc", budgetAmount: "Ngân sách dự kiến (VND)" };
  const control = labels[name] ? cloneElement(children, { "aria-label": labels[name] }) : children;
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium">
        {label}
      </label>
      <div className="mt-2">{control}</div>
      {error && (
        <p id={`${name}-error`} role="alert" className="mt-1 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
