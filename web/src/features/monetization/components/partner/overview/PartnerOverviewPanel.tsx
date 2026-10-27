"use client";
import { toast } from "@/components/ui/sonner";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, MapPin, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { WorkspacePage } from "@/components/shell/WorkspacePage";
import {
  createPartnerListing,
  deletePartnerListing,
  getPartnerListings,
  updatePartnerListing,
  type PartnerListing,
} from "@/features/partner/api/partner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const areas = [
  {
    href: "/partner/campaigns",
    label: "Chiến dịch",
    description: "Tạo và theo dõi vị trí hiển thị khi module quảng cáo sẵn sàng.",
  },
  {
    href: "/partner/analytics",
    label: "Phân tích",
    description: "Xem hiệu quả và chỉ số khi doanh nghiệp bắt đầu có dữ liệu.",
  },
  {
    href: "/partner/reviews",
    label: "Đánh giá",
    description: "Theo dõi phản hồi của khách khi review được kích hoạt.",
  },
  {
    href: "/partner/billing",
    label: "Thanh toán",
    description: "Quản lý hoá đơn và phương thức thanh toán khi được kết nối.",
  },
] as const;

export default function PartnerOverviewPanel() {
  const [listings, setListings] = useState<PartnerListing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [errorListings, setErrorListings] = useState<string>();

  // Modal create listing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<PartnerListing["category"]>("STAY");
  const [locationName, setLocationName] = useState("");
  const [priceAmount, setPriceAmount] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const loadListings = useCallback(async () => {
    try {
      setLoadingListings(true);
      setErrorListings(undefined);
      const data = await getPartnerListings();
      setListings([...data]);
    } catch (err) {
      setErrorListings(err instanceof Error ? err.message : "Không thể tải danh sách dịch vụ.");
    } finally {
      setLoadingListings(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadListings(), 0);
    return () => window.clearTimeout(timer);
  }, [loadListings]);

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !locationName.trim() || !priceAmount) return;

    try {
      setSubmitting(true);
      const mediaUrls = mediaUrl.trim() ? [mediaUrl.trim()] : [];
      const newListing = await createPartnerListing({
        title: title.trim(),
        description: description.trim(),
        category,
        locationName: locationName.trim(),
        priceAmount: parseFloat(priceAmount),
        mediaUrls,
        status: "ACTIVE",
      });
      setListings((prev) => [newListing, ...prev]);
      setIsModalOpen(false);
      setTitle("");
      setDescription("");
      setLocationName("");
      setPriceAmount("");
      setMediaUrl("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể tạo dịch vụ đối tác.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (listing: PartnerListing) => {
    const nextStatus = listing.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
    try {
      await updatePartnerListing(listing.id, { status: nextStatus });
      setListings((prev) =>
        prev.map((l) => (l.id === listing.id ? { ...l, status: nextStatus } : l)),
      );
    } catch {
      toast.error("Không thể cập nhật trạng thái dịch vụ.");
    }
  };

  const handleDeleteListing = (listingId: string) => setPendingDeleteId(listingId);

  const confirmDeleteListing = async () => {
    const listingId = pendingDeleteId;
    setPendingDeleteId(null);
    if (!listingId) return;
    try {
      await deletePartnerListing(listingId);
      setListings((prev) => prev.filter((l) => l.id !== listingId));
    } catch {
      toast.error("Không thể xóa dịch vụ.");
    }
  };

  const activeCount = listings.filter((l) => l.status === "ACTIVE").length;

  return (
    <WorkspacePage
      title="Quản lý dịch vụ đối tác"
      description="Đăng ký và theo dõi danh sách phòng nghỉ, nhà hàng, tour và dịch vụ xe của bạn để kết nối với khách du lịch Tripz."
    >
      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Xóa dịch vụ?"
        description="Bạn có chắc chắn muốn xóa dịch vụ này? Thao tác này không thể hoàn tác."
        confirmLabel="Xóa dịch vụ"
        onConfirm={confirmDeleteListing}
        onClose={() => setPendingDeleteId(null)}
      />

      <dl className="flex flex-wrap gap-x-12 gap-y-4">
        <div>
          <dt className="text-sm text-muted-foreground">Tổng dịch vụ niêm yết</dt>
          <dd className="mt-1 text-4xl font-medium tabular-nums tracking-tight">{listings.length}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Đang hoạt động</dt>
          <dd className="mt-1 text-4xl font-medium tabular-nums tracking-tight">{activeCount}</dd>
        </div>
      </dl>

      <section className="mt-12" aria-labelledby="listings-title">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <h2 id="listings-title" className="text-2xl font-medium tracking-tight">Danh sách dịch vụ niêm yết</h2>
          <Button type="button" className="min-h-11 self-start sm:self-auto" onClick={() => setIsModalOpen(true)}>
            <Plus aria-hidden="true" /> Thêm dịch vụ mới
          </Button>
        </div>

        {loadingListings ? (
          <div className="mt-6 grid gap-1" aria-busy="true" aria-label="Đang tải danh sách dịch vụ">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-24 rounded-lg" />
            ))}
          </div>
        ) : errorListings ? (
          <div className="mt-6 rounded-xl bg-muted p-6">
            <p role="alert" className="text-sm text-destructive">{errorListings}</p>
            <Button type="button" className="mt-4 min-h-11" onClick={loadListings}>Thử lại</Button>
          </div>
        ) : listings.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-border px-6 py-14 text-center">
            <h3 className="text-lg font-medium">Bạn chưa có dịch vụ nào</h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Bấm &ldquo;Thêm dịch vụ mới&rdquo; để niêm yết phòng nghỉ, nhà hàng hoặc tour du lịch đầu tiên.
            </p>
          </div>
        ) : (
          <ul className="mt-6 grid gap-1">
            {listings.map((item, index) => (
              <li key={item.id} className={`flex flex-col gap-4 rounded-lg p-4 sm:flex-row sm:items-center ${index % 2 === 0 ? "bg-muted" : "bg-muted/50"}`}>
                {item.mediaUrls[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element -- partner media is uploaded to configurable storage hosts.
                  <img src={item.mediaUrls[0]} alt={item.title} className="h-24 w-full rounded-md object-cover sm:w-36" />
                ) : (
                  <div className="h-24 w-full rounded-md bg-border sm:w-36" aria-hidden="true" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-muted-foreground">
                    {item.category} · <span className={item.status === "ACTIVE" ? "text-success" : ""}>{item.status === "ACTIVE" ? "Đang mở" : "Tạm dừng"}</span>
                  </p>
                  <h3 className="mt-0.5 line-clamp-1 text-lg font-medium">{item.title}</h3>
                  <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{item.locationName}</span>
                  </p>
                </div>
                <div className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end">
                  <span className="text-lg font-medium tabular-nums">{new Intl.NumberFormat("vi-VN").format(item.priceAmount)} {item.priceCurrency}</span>
                  <span className="flex items-center gap-1">
                    <Button type="button" variant="outline" size="sm" className="min-h-11" onClick={() => handleToggleStatus(item)}>
                      {item.status === "ACTIVE" ? "Tạm dừng" : "Kích hoạt"}
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="size-11 text-destructive hover:text-destructive" title="Xóa dịch vụ" aria-label={`Xóa dịch vụ ${item.title}`} onClick={() => handleDeleteListing(item.id)}>
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-16" aria-labelledby="modules-title">
        <h2 id="modules-title" className="text-2xl font-medium tracking-tight">Không gian nghiệp vụ</h2>
        <ul className="mt-5 grid gap-1">
          {areas.map(({ href, label, description }, index) => (
            <li key={href} className={`rounded-lg ${index % 2 === 0 ? "bg-muted" : "bg-muted/50"}`}>
              <Link href={href} className="focus-ring flex min-h-20 items-center justify-between gap-6 rounded-lg px-5 py-4 transition-colors hover:bg-border/60">
                <span>
                  <span className="block text-lg font-medium">{label}</span>
                  <span className="block text-sm text-muted-foreground">{description}</span>
                </span>
                <ArrowUpRight className="size-5 shrink-0" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <Dialog open={!!isModalOpen} onOpenChange={(open) => { if (!open) setIsModalOpen(false); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Thêm dịch vụ / gói tour mới</DialogTitle>
            <DialogDescription className="sr-only">Biểu mẫu trong hộp thoại</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateListing} className="mt-2 space-y-4">
            <div>
              <label htmlFor="pl-title" className="block text-sm font-medium">Tiêu đề dịch vụ *</label>
              <Input id="pl-title" type="text" required placeholder="Ví dụ: Phòng Deluxe view núi - Sapa Mountain View..." value={title} onChange={(e) => setTitle(e.target.value)} className="mt-2 h-11" />
            </div>
            <div>
              <label htmlFor="pl-category" className="block text-sm font-medium">Phân loại *</label>
              <select id="pl-category" value={category} onChange={(e) => setCategory(e.target.value as PartnerListing["category"])} className="field mt-2 min-h-11 w-full bg-card">
                <option value="STAY">Lưu trú (Khách sạn/Homestay)</option>
                <option value="FOOD">Ẩm thực / Nhà hàng</option>
                <option value="EXPERIENCE">Trải nghiệm / Tour phượt</option>
                <option value="TRANSPORT">Thuê xe / Đưa đón</option>
                <option value="EQUIPMENT">Thuê đồ cắm trại / Dã ngoại</option>
              </select>
            </div>
            <div>
              <label htmlFor="pl-desc" className="block text-sm font-medium">Mô tả chi tiết *</label>
              <Textarea id="pl-desc" required rows={3} placeholder="Tiện nghi, dịch vụ bao gồm, lưu ý check-in..." value={description} onChange={(e) => setDescription(e.target.value)} className="mt-2 min-h-24" />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="pl-location" className="block text-sm font-medium">Địa điểm *</label>
                <Input id="pl-location" type="text" required placeholder="Ví dụ: Sa Pa, Lào Cai" value={locationName} onChange={(e) => setLocationName(e.target.value)} className="mt-2 h-11" />
              </div>
              <div>
                <label htmlFor="pl-price" className="block text-sm font-medium">Giá niêm yết (VND) *</label>
                <Input id="pl-price" type="number" required min={0} placeholder="650000" value={priceAmount} onChange={(e) => setPriceAmount(e.target.value)} className="mt-2 h-11" />
              </div>
            </div>
            <div>
              <label htmlFor="pl-media" className="block text-sm font-medium">URL ảnh đại diện</label>
              <Input id="pl-media" type="url" placeholder="https://images.unsplash.com/..." value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} className="mt-2 h-11" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" className="min-h-11" onClick={() => setIsModalOpen(false)}>
                Hủy bỏ
              </Button>
              <Button type="submit" className="min-h-11" disabled={submitting}>
                {submitting ? "Đang lưu..." : "Tạo dịch vụ"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </WorkspacePage>
  );
}
