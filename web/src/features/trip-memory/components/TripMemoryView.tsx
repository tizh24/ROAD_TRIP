"use client";
import { toast } from "@/components/ui/sonner";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, BookOpen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GatewayApiError } from "@/features/trip-planning/api/gateway-request";
import {
  addTripExpense,
  addTripMemoryPhoto,
  deleteTripExpense,
  getTrip,
  getTripMemory,
  listMembers,
  listTripExpenses,
  updateTripMemory,
} from "@/features/trip-planning/api/trips";
import type {
  Member,
  TripDetail,
  TripExpense,
  TripMemory,
} from "@/features/trip-planning/api/trip-model";
import FeedbackState from "@/components/ui/FeedbackState";

const expenseCategoryLabels: Record<string, string> = {
  FOOD: "Ăn uống",
  STAY: "Lưu trú",
  FUEL: "Xăng xe, cầu đường",
  ACTIVITY: "Vé, trải nghiệm",
  OTHER: "Khác",
};

export default function TripMemoryView({ tripId }: { tripId: string }) {
  const [trip, setTrip] = useState<TripDetail>();
  const [memory, setMemory] = useState<TripMemory>();
  const [expenses, setExpenses] = useState<readonly TripExpense[]>([]);
  const [members, setMembers] = useState<readonly Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  // Photo form state
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoCaption, setPhotoCaption] = useState("");
  const [addingPhoto, setAddingPhoto] = useState(false);

  // Expense form state
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<"FOOD" | "STAY" | "FUEL" | "ACTIVITY" | "OTHER">("FOOD");
  const [description, setDescription] = useState("");
  const [addingExpense, setAddingExpense] = useState(false);

  // Visibility state
  const [savingVisibility, setSavingVisibility] = useState(false);
  const [pendingExpenseId, setPendingExpenseId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [t, m, e, mems] = await Promise.all([
        getTrip(tripId),
        getTripMemory(tripId),
        listTripExpenses(tripId),
        listMembers(tripId),
      ]);
      setTrip(t);
      setMemory(m);
      setExpenses(e);
      setMembers(mems);
      setError(undefined);
    } catch (cause) {
      if (cause instanceof GatewayApiError && cause.code === "TRIP_NOT_FOUND") {
        setError("Không tìm thấy chuyến đi.");
      } else if (cause instanceof GatewayApiError && cause.code === "FORBIDDEN") {
        setError("Bạn không có quyền truy cập nhật ký chuyến đi này.");
      } else {
        setError(cause instanceof Error ? cause.message : "Không thể tải nhật ký hành trình.");
      }
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function handleAddPhoto(e: React.FormEvent) {
    e.preventDefault();
    if (!photoUrl.trim()) return;
    setAddingPhoto(true);
    try {
      await addTripMemoryPhoto(tripId, { photoUrl: photoUrl.trim(), caption: photoCaption.trim() || null });
      setPhotoUrl("");
      setPhotoCaption("");
      await load();
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Không thể thêm ảnh.");
    } finally {
      setAddingPhoto(false);
    }
  }

  async function handleAddExpense(e: React.FormEvent) {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || !description.trim()) return;
    setAddingExpense(true);
    try {
      await addTripExpense(tripId, {
        amount: parsedAmount,
        category,
        description: description.trim(),
      });
      setAmount("");
      setDescription("");
      await load();
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Không thể lưu khoản chi tiêu.");
    } finally {
      setAddingExpense(false);
    }
  }

  function handleDeleteExpense(expenseId: string) {
    setPendingExpenseId(expenseId);
  }

  async function confirmDeleteExpense() {
    const expenseId = pendingExpenseId;
    setPendingExpenseId(null);
    if (!expenseId) return;
    try {
      await deleteTripExpense(tripId, expenseId);
      await load();
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Không thể xóa chi tiêu.");
    }
  }

  async function handleVisibilityChange(newVisibility: "PRIVATE" | "UNLISTED" | "PUBLISHED") {
    if (!memory || memory.visibility === newVisibility) return;
    setSavingVisibility(true);
    try {
      await updateTripMemory(tripId, {
        title: memory.title,
        summary: memory.summary,
        visibility: newVisibility,
        coverPhotoUrl: memory.coverPhotoUrl,
      });
      await load();
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Không thể cập nhật quyền hiển thị.");
    } finally {
      setSavingVisibility(false);
    }
  }

  if (loading) {
    return (
      <div className="page-shell w-full px-4 py-10 sm:px-6" aria-busy="true">
        <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="mt-8 h-96 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (error || !trip || !memory) {
    return (
      <div className="page-shell py-20">
        <FeedbackState kind="error" title="Không thể mở nhật ký hành trình" description={error ?? "Dữ liệu nhật ký chưa khả dụng."}>
          <Link href="/dashboard" className="focus-ring mt-3 text-sm font-medium underline underline-offset-4">
            Về danh sách chuyến đi
          </Link>
        </FeedbackState>
      </div>
    );
  }

  const totalExpenseAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const activeMembersCount = Math.max(members.filter((m) => m.status === "ACTIVE").length, 1);
  const perPersonAmount = Math.round(totalExpenseAmount / activeMembersCount);
  const canEdit = trip.role === "OWNER" || trip.permission === "EDIT";
  const visibilityLabel = memory.visibility === "PUBLISHED" ? "Công khai" : memory.visibility === "UNLISTED" ? "Có liên kết" : "Riêng tư";

  return (
    <div className="page-shell px-4 py-8 sm:px-6 sm:py-10">
      <ConfirmDialog
        open={pendingExpenseId !== null}
        title="Xóa khoản chi tiêu?"
        description="Bạn có chắc chắn muốn xóa khoản chi tiêu này? Thao tác này không thể hoàn tác."
        confirmLabel="Xóa khoản chi"
        onConfirm={confirmDeleteExpense}
        onClose={() => setPendingExpenseId(null)}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/dashboard" className="focus-ring inline-flex min-h-11 items-center gap-1.5 rounded text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
          <ArrowLeft className="size-4" aria-hidden="true" /> Về danh sách chuyến đi
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" className="min-h-11">
            <Link href={`/road/${trip.id}`}>Xem lộ trình đi đường</Link>
          </Button>
          <Button asChild className="min-h-11">
            <Link href={`/travel-book/${trip.id}`}>
              <BookOpen aria-hidden="true" /> In Travel Book
            </Link>
          </Button>
        </div>
      </div>

      <header className="mt-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div className="max-w-3xl">
          <p className="text-sm text-muted-foreground">Kỷ niệm hành trình · {visibilityLabel}</p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight sm:text-4xl">{memory.title || trip.title}</h1>
          <p className="mt-2 text-sm tabular-nums text-muted-foreground">
            {trip.startDate} → {trip.endDate} · {trip.days.length} ngày khám phá
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {memory.summary || trip.description || "Hành trình trọn vẹn với những khoảnh khắc đáng nhớ cùng bạn bè."}
          </p>
        </div>

        {trip.role === "OWNER" && (
          <div className="rounded-xl bg-muted p-4">
            <label htmlFor="memory-visibility" className="block text-sm font-medium">
              Quyền xem kỷ niệm
            </label>
            <select
              id="memory-visibility"
              disabled={savingVisibility}
              value={memory.visibility}
              onChange={(e) => void handleVisibilityChange(e.target.value as "PRIVATE" | "UNLISTED" | "PUBLISHED")}
              className="field mt-2 min-h-11 w-full bg-card"
            >
              <option value="PRIVATE">Chỉ thành viên chuyến đi</option>
              <option value="UNLISTED">Bất kỳ ai có đường link</option>
              <option value="PUBLISHED">Công khai trên cộng đồng</option>
            </select>
          </div>
        )}
      </header>

      <section className="mt-12" aria-labelledby="photos-heading">
        <h2 id="photos-heading" className="text-2xl font-medium tracking-tight">
          Album hành trình
          <span className="ml-3 text-base font-normal tabular-nums text-muted-foreground">{memory.photos.length} ảnh</span>
        </h2>

        {canEdit && (
          <form onSubmit={(e) => void handleAddPhoto(e)} className="mt-5 rounded-xl bg-muted p-4 sm:p-5">
            <h3 className="text-sm font-medium">Thêm ảnh mới vào nhật ký</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <Input type="url" required value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="Đường dẫn ảnh (URL: https://...)" aria-label="Đường dẫn ảnh" className="h-11 bg-card" />
              <Input type="text" value={photoCaption} onChange={(e) => setPhotoCaption(e.target.value)} placeholder="Ghi chú ảnh (vd: Bình minh Mã Pí Lèng)" aria-label="Ghi chú ảnh" className="h-11 bg-card" />
              <Button type="submit" disabled={addingPhoto} className="min-h-11">
                {addingPhoto ? "Đang lưu…" : "Thêm ảnh"}
              </Button>
            </div>
          </form>
        )}

        {memory.photos.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-border px-6 py-12 text-center">
            <h3 className="text-lg font-medium">Chưa có ảnh nào được thêm vào kỷ niệm</h3>
            <p className="mt-1 text-sm text-muted-foreground">Hãy thêm ảnh để lưu giữ những chặng đường tuyệt đẹp.</p>
          </div>
        ) : (
          <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {memory.photos.map((photo) => (
              <li key={photo.id}>
                <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element -- trip-memory photos are user-uploaded URLs from configurable storage hosts. */}
                  <img src={photo.photoUrl} alt={photo.caption || "Ảnh chuyến đi"} className="h-full w-full object-cover" loading="lazy" />
                </div>
                {photo.caption && <p className="mt-2 truncate text-sm text-muted-foreground">{photo.caption}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-16" aria-labelledby="expenses-heading">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 id="expenses-heading" className="text-2xl font-medium tracking-tight">
            Sổ quỹ hành trình
          </h2>
          <dl className="flex gap-8">
            <div>
              <dt className="text-sm text-muted-foreground">Tổng chi tiêu</dt>
              <dd className="mt-1 text-2xl font-medium tabular-nums tracking-tight">{totalExpenseAmount.toLocaleString("vi-VN")} VND</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Mỗi người ({activeMembersCount} người)</dt>
              <dd className="mt-1 text-2xl font-medium tabular-nums tracking-tight">{perPersonAmount.toLocaleString("vi-VN")} VND</dd>
            </div>
          </dl>
        </div>

        {canEdit && (
          <form onSubmit={(e) => void handleAddExpense(e)} className="mt-5 rounded-xl bg-muted p-4 sm:p-5">
            <h3 className="text-sm font-medium">Ghi nhận khoản chi tiêu mới</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_1.5fr_auto]">
              <Input type="number" min="1000" step="1000" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Số tiền (VND)" aria-label="Số tiền (VND)" className="h-11 bg-card" />
              <select
                aria-label="Hạng mục chi tiêu"
                value={category}
                onChange={(e) => setCategory(e.target.value as "FOOD" | "STAY" | "FUEL" | "ACTIVITY" | "OTHER")}
                className="field min-h-11 bg-card"
              >
                <option value="FOOD">Ăn uống (FOOD)</option>
                <option value="STAY">Khách sạn / Homestay (STAY)</option>
                <option value="FUEL">Xăng xe / Vé cầu đường (FUEL)</option>
                <option value="ACTIVITY">Vé tham quan / Trải nghiệm (ACTIVITY)</option>
                <option value="OTHER">Chi phí khác (OTHER)</option>
              </select>
              <Input type="text" required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Nội dung chi tiêu (vd: Ăn trưa Đồng Văn)" aria-label="Nội dung chi tiêu" className="h-11 bg-card" />
              <Button type="submit" disabled={addingExpense} className="min-h-11">
                {addingExpense ? "Đang lưu…" : "Ghi sổ"}
              </Button>
            </div>
          </form>
        )}

        {expenses.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-border px-6 py-12 text-center">
            <h3 className="text-lg font-medium">Chưa có khoản chi tiêu nào được ghi nhận</h3>
            <p className="mt-1 text-sm text-muted-foreground">Ghi lại các khoản chi để tự động tính tiền chia đều cho cả đoàn.</p>
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-muted-foreground">
                  <th scope="col" className="px-4 pb-2 font-normal">Hạng mục</th>
                  <th scope="col" className="px-4 pb-2 font-normal">Mô tả</th>
                  <th scope="col" className="px-4 pb-2 text-right font-normal">Số tiền</th>
                  <th scope="col" className="px-4 pb-2 text-right font-normal"><span className="sr-only">Thao tác</span></th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp, index) => (
                  <tr key={exp.id} className={index % 2 === 0 ? "bg-muted" : "bg-muted/50"}>
                    <td className="rounded-l-lg px-4 py-3">{expenseCategoryLabels[exp.category] ?? exp.category}</td>
                    <td className="px-4 py-3">{exp.description}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {exp.amount.toLocaleString("vi-VN")} {exp.currency}
                    </td>
                    <td className="rounded-r-lg px-2 py-1 text-right">
                      {canEdit && (
                        <Button type="button" variant="ghost" size="icon" className="size-11 text-destructive hover:text-destructive" onClick={() => void handleDeleteExpense(exp.id)} aria-label={`Xóa khoản chi ${exp.description}`}>
                          <Trash2 aria-hidden="true" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
