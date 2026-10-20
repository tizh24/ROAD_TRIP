"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Camera,
  Globe,
  Image as ImageIcon,
  Lock,
  Plus,
  Share2,
  Trash2,
  Wallet,
} from "lucide-react";
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
      alert(cause instanceof Error ? cause.message : "Không thể thêm ảnh.");
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
      alert(cause instanceof Error ? cause.message : "Không thể lưu khoản chi tiêu.");
    } finally {
      setAddingExpense(false);
    }
  }

  async function handleDeleteExpense(expenseId: string) {
    if (!confirm("Bạn có chắc chắn muốn xóa khoản chi tiêu này?")) return;
    try {
      await deleteTripExpense(tripId, expenseId);
      await load();
    } catch (cause) {
      alert(cause instanceof Error ? cause.message : "Không thể xóa chi tiêu.");
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
      alert(cause instanceof Error ? cause.message : "Không thể cập nhật quyền hiển thị.");
    } finally {
      setSavingVisibility(false);
    }
  }

  if (loading) {
    return (
      <main className="page-shell w-full py-16" aria-busy="true">
        <div className="h-8 w-64 animate-pulse rounded bg-border-main" />
        <div className="surface-card mt-8 h-96 animate-pulse" />
      </main>
    );
  }

  if (error || !trip || !memory) {
    return (
      <main className="page-shell py-20">
        <FeedbackState
          kind="error"
          title="Không thể mở nhật ký hành trình"
          description={error ?? "Dữ liệu nhật ký chưa khả dụng."}
        >
          <Link href="/dashboard" className="focus-ring mt-3 text-sm font-bold text-primary underline">
            Về danh sách chuyến đi
          </Link>
        </FeedbackState>
      </main>
    );
  }

  const totalExpenseAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const activeMembersCount = Math.max(members.filter((m) => m.status === "ACTIVE").length, 1);
  const perPersonAmount = Math.round(totalExpenseAmount / activeMembersCount);

  return (
    <main className="min-h-screen bg-background-warm pb-20">
      {/* Header */}
      <section className="relative isolate overflow-hidden bg-secondary px-4 py-8 text-white sm:px-6 lg:py-12">
        <div className="page-shell px-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/dashboard"
              className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-2 text-xs font-bold text-white/90 hover:bg-white/20"
            >
              <ArrowLeft size={14} />
              <span>Về danh sách chuyến đi</span>
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href={`/travel-book/${trip.id}`}
                className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary-hover transition"
              >
                <BookOpen size={14} />
                <span>In Travel Book</span>
              </Link>
              <Link
                href={`/road/${trip.id}`}
                className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-2 text-xs font-bold text-white/90 hover:bg-white/20"
              >
                <span>Xem lộ trình đi đường</span>
              </Link>
            </div>
          </div>

          <div className="mt-6 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-3 py-1 text-xs font-bold text-primary-200">
                  <Camera size={13} />
                  Kỷ niệm hành trình
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold">
                  {memory.visibility === "PUBLISHED" ? <Globe size={13} /> : memory.visibility === "UNLISTED" ? <Share2 size={13} /> : <Lock size={13} />}
                  {memory.visibility === "PUBLISHED" ? "Công khai" : memory.visibility === "UNLISTED" ? "Có liên kết" : "Riêng tư"}
                </span>
              </div>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">
                {memory.title || trip.title}
              </h1>
              <p className="mt-2 text-sm text-white/70">
                {trip.startDate} → {trip.endDate} · {trip.days.length} ngày khám phá
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85 sm:text-base">
                {memory.summary || trip.description || "Hành trình trọn vẹn với những khoảnh khắc đáng nhớ cùng bạn bè."}
              </p>
            </div>

            {/* Visibility Selector */}
            {trip.role === "OWNER" && (
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <label className="block text-xs font-bold uppercase tracking-wider text-white/70">
                  Quyền xem kỷ niệm
                </label>
                <select
                  disabled={savingVisibility}
                  value={memory.visibility}
                  onChange={(e) => void handleVisibilityChange(e.target.value as "PRIVATE" | "UNLISTED" | "PUBLISHED")}
                  className="mt-2 w-full rounded-xl border border-white/20 bg-secondary/80 px-3 py-2 text-xs font-bold text-white shadow-sm focus:outline-none"
                >
                  <option value="PRIVATE">🔒 Chỉ thành viên chuyến đi</option>
                  <option value="UNLISTED">🔗 Bất kỳ ai có đường link</option>
                  <option value="PUBLISHED">🌐 Công khai trên cộng đồng</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="page-shell px-4 sm:px-6">
        {/* Gallery / Photos Section */}
        <section className="surface-card mt-8 p-5 sm:p-7" aria-labelledby="photos-heading">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-main pb-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-primary">Ảnh chụp khoảnh khắc</p>
              <h2 id="photos-heading" className="mt-0.5 text-xl font-extrabold text-text-main">
                Album hành trình ({memory.photos.length} ảnh)
              </h2>
            </div>
          </div>

          {/* Add Photo Form */}
          {(trip.role === "OWNER" || trip.permission === "EDIT") && (
            <form onSubmit={(e) => void handleAddPhoto(e)} className="mt-5 rounded-2xl bg-background-warm p-4 sm:p-5">
              <h3 className="text-sm font-extrabold text-text-main flex items-center gap-2">
                <Plus size={16} className="text-primary" />
                Thêm ảnh mới vào nhật ký
              </h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                <input
                  type="url"
                  required
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="Đường dẫn ảnh (URL: https://...)"
                  className="field bg-surface text-sm"
                />
                <input
                  type="text"
                  value={photoCaption}
                  onChange={(e) => setPhotoCaption(e.target.value)}
                  placeholder="Ghi chú ảnh (vd: Bình minh Mã Pí Lèng)"
                  className="field bg-surface text-sm"
                />
                <button
                  type="submit"
                  disabled={addingPhoto}
                  className="focus-ring rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-card hover:bg-primary-hover disabled:opacity-50"
                >
                  {addingPhoto ? "Đang lưu…" : "Thêm ảnh"}
                </button>
              </div>
            </form>
          )}

          {/* Photos Grid */}
          {memory.photos.length === 0 ? (
            <div className="my-8 rounded-2xl border border-dashed border-border-main p-8 text-center">
              <ImageIcon className="mx-auto text-text-sub opacity-50" size={36} />
              <p className="mt-2 text-sm font-bold text-text-main">Chưa có ảnh nào được thêm vào kỷ niệm</p>
              <p className="text-xs text-text-sub">Hãy thêm ảnh để lưu giữ những chặng đường tuyệt đẹp!</p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {memory.photos.map((photo) => (
                <div key={photo.id} className="group relative overflow-hidden rounded-2xl border border-border-main bg-surface shadow-sm">
                  <div className="aspect-[4/3] w-full overflow-hidden bg-background-warm">
                    <img
                      src={photo.photoUrl}
                      alt={photo.caption || "Ảnh chuyến đi"}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  {photo.caption && (
                    <div className="p-3">
                      <p className="text-xs font-semibold text-text-main truncate">{photo.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Expenses & Split Section */}
        <section className="surface-card mt-8 p-5 sm:p-7" aria-labelledby="expenses-heading">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-main pb-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-secondary">Chi tiêu & Quyết toán</p>
              <h2 id="expenses-heading" className="mt-0.5 text-xl font-extrabold text-text-main">
                Sổ quỹ hành trình
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 px-3.5 py-2 text-right">
                <span className="block text-[10px] font-bold uppercase text-primary">Tổng chi tiêu</span>
                <strong className="text-base font-extrabold text-primary">
                  {totalExpenseAmount.toLocaleString("vi-VN")} VND
                </strong>
              </div>
              <div className="rounded-xl bg-secondary/10 px-3.5 py-2 text-right">
                <span className="block text-[10px] font-bold uppercase text-secondary">Mỗi người ({activeMembersCount} người)</span>
                <strong className="text-base font-extrabold text-secondary">
                  {perPersonAmount.toLocaleString("vi-VN")} VND
                </strong>
              </div>
            </div>
          </div>

          {/* Add Expense Form */}
          {(trip.role === "OWNER" || trip.permission === "EDIT") && (
            <form onSubmit={(e) => void handleAddExpense(e)} className="mt-5 rounded-2xl bg-background-warm p-4 sm:p-5">
              <h3 className="text-sm font-extrabold text-text-main flex items-center gap-2">
                <Plus size={16} className="text-primary" />
                Ghi nhận khoản chi tiêu mới
              </h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_1.5fr_auto]">
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Số tiền (VND)"
                  className="field bg-surface text-sm"
                />
                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(
                      e.target.value as "FOOD" | "STAY" | "FUEL" | "ACTIVITY" | "OTHER",
                    )
                  }
                  className="field bg-surface text-sm"
                >
                  <option value="FOOD">Ăn uống (FOOD)</option>
                  <option value="STAY">Khách sạn / Homestay (STAY)</option>
                  <option value="FUEL">Xăng xe / Vé cầu đường (FUEL)</option>
                  <option value="ACTIVITY">Vé tham quan / Trải nghiệm (ACTIVITY)</option>
                  <option value="OTHER">Chi phí khác (OTHER)</option>
                </select>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Nội dung chi tiêu (vd: Ăn trưa Đồng Văn)"
                  className="field bg-surface text-sm"
                />
                <button
                  type="submit"
                  disabled={addingExpense}
                  className="focus-ring rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-card hover:bg-primary-hover disabled:opacity-50"
                >
                  {addingExpense ? "Đang lưu…" : "Ghi sổ"}
                </button>
              </div>
            </form>
          )}

          {/* Expenses List */}
          {expenses.length === 0 ? (
            <div className="my-8 rounded-2xl border border-dashed border-border-main p-8 text-center">
              <Wallet className="mx-auto text-text-sub opacity-50" size={36} />
              <p className="mt-2 text-sm font-bold text-text-main">Chưa có khoản chi tiêu nào được ghi nhận</p>
              <p className="text-xs text-text-sub">Ghi lại các khoản chi để tự động tính tiền chia sẻ đều cho cả đoàn.</p>
            </div>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border-main text-xs font-extrabold uppercase text-text-sub">
                    <th className="pb-3">Hạng mục</th>
                    <th className="pb-3">Mô tả</th>
                    <th className="pb-3 text-right">Số tiền</th>
                    <th className="pb-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-main">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-background-warm/50">
                      <td className="py-3 font-semibold text-text-main">
                        <span className="rounded-lg bg-background-warm px-2 py-1 text-xs font-bold text-secondary">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3 text-text-main">{exp.description}</td>
                      <td className="py-3 text-right font-extrabold text-primary">
                        {exp.amount.toLocaleString("vi-VN")} {exp.currency}
                      </td>
                      <td className="py-3 text-right">
                        {(trip.role === "OWNER" || trip.permission === "EDIT") && (
                          <button
                            type="button"
                            onClick={() => void handleDeleteExpense(exp.id)}
                            className="rounded p-1 text-danger hover:bg-danger/10"
                            aria-label={`Xóa khoản chi ${exp.description}`}
                          >
                            <Trash2 size={15} />
                          </button>
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
    </main>
  );
}
