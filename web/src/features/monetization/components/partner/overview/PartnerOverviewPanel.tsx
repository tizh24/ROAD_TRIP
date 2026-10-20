"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  CreditCard,
  Image as ImageIcon,
  MapPin,
  Megaphone,
  MessageSquare,
  Plus,
  Store,
  Tag,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import {
  createPartnerListing,
  deletePartnerListing,
  getPartnerListings,
  updatePartnerListing,
  type PartnerListing,
} from "@/features/partner/api/partner";

const areas = [
  {
    href: "/partner/campaigns",
    icon: Megaphone,
    label: "Chiến dịch",
    description: "Tạo và theo dõi vị trí hiển thị khi module quảng cáo sẵn sàng.",
  },
  {
    href: "/partner/analytics",
    icon: BarChart3,
    label: "Phân tích",
    description: "Xem hiệu quả và chỉ số khi doanh nghiệp bắt đầu có dữ liệu.",
  },
  {
    href: "/partner/reviews",
    icon: MessageSquare,
    label: "Đánh giá",
    description: "Theo dõi phản hồi của khách khi review được kích hoạt.",
  },
  {
    href: "/partner/billing",
    icon: CreditCard,
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
      alert(err instanceof Error ? err.message : "Không thể tạo dịch vụ đối tác.");
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
      alert("Không thể cập nhật trạng thái dịch vụ.");
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa dịch vụ này?")) return;
    try {
      await deletePartnerListing(listingId);
      setListings((prev) => prev.filter((l) => l.id !== listingId));
    } catch {
      alert("Không thể xóa dịch vụ.");
    }
  };

  const activeCount = listings.filter((l) => l.status === "ACTIVE").length;

  return (
    <main className="min-h-full bg-[#f7f1e8] p-4 sm:p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header Hero */}
        <header className="rounded-[2rem] bg-secondary p-7 text-white sm:p-10">
          <p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#f2c369]">
            Partner Workspace
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-[-.04em] sm:text-5xl">
            Không gian Quản lý<br />Dịch vụ Đối tác.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/75">
            Đăng ký và theo dõi danh sách phòng nghỉ, nhà hàng, tour và dịch vụ xe của bạn để kết nối với khách du lịch Tripz.
          </p>

          <div className="mt-6 flex flex-wrap gap-4 pt-2">
            <div className="rounded-2xl bg-white/10 px-5 py-3 backdrop-blur-sm">
              <span className="text-xs text-white/70">Tổng dịch vụ niêm yết</span>
              <p className="text-2xl font-black text-white">{listings.length}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-5 py-3 backdrop-blur-sm">
              <span className="text-xs text-white/70">Đang hoạt động</span>
              <p className="text-2xl font-black text-emerald-400">{activeCount}</p>
            </div>
          </div>
        </header>

        {/* Listings Section */}
        <section className="rounded-3xl border border-border-main bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-main pb-5">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[.14em] text-primary">
                Sản phẩm & Dịch vụ
              </p>
              <h2 className="mt-1 text-2xl font-black text-text-main">
                Danh sách Dịch vụ Niêm yết
              </h2>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-primary-hover active:scale-95 transition"
            >
              <Plus size={16} /> Thêm dịch vụ mới
            </button>
          </div>

          {loadingListings ? (
            <div className="py-12 text-center text-sm text-text-sub">
              Đang tải danh sách dịch vụ của bạn...
            </div>
          ) : errorListings ? (
            <div className="mt-4 rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-700">
              {errorListings}
            </div>
          ) : listings.length === 0 ? (
            <div className="py-12 text-center">
              <Store className="mx-auto text-text-sub opacity-40" size={40} />
              <p className="mt-3 text-base font-bold text-text-main">Bạn chưa có dịch vụ nào</p>
              <p className="mt-1 text-xs text-text-sub">
                Bấm vào nút &ldquo;Thêm dịch vụ mới&rdquo; phía trên để niêm yết phòng nghỉ, nhà hàng hoặc tour du lịch đầu tiên!
              </p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((item) => (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-border-main bg-background p-4 shadow-sm transition hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    {item.mediaUrls[0] ? (
                      <img
                        src={item.mediaUrls[0]}
                        alt={item.title}
                        className="h-36 w-full rounded-xl object-cover mb-3"
                      />
                    ) : (
                      <div className="h-36 w-full rounded-xl bg-gray-100 flex items-center justify-center text-text-sub mb-3">
                        <ImageIcon size={28} />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-extrabold text-primary uppercase">
                        {item.category}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          item.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {item.status === "ACTIVE" ? "Đang mở" : "Tạm dừng"}
                      </span>
                    </div>

                    <h3 className="mt-2 font-bold text-text-main text-base line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs text-text-sub line-clamp-2">{item.description}</p>

                    <div className="mt-3 flex items-center gap-1.5 text-xs text-text-sub">
                      <MapPin size={13} className="text-primary" />
                      <span className="truncate">{item.locationName}</span>
                    </div>

                    <div className="mt-2 flex items-center gap-1 text-sm font-black text-emerald-700">
                      <Wallet size={14} />
                      <span>{new Intl.NumberFormat("vi-VN").format(item.priceAmount)} {item.priceCurrency}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border-main pt-3">
                    <button
                      onClick={() => handleToggleStatus(item)}
                      className="text-xs font-bold text-text-sub hover:text-text-main transition"
                    >
                      {item.status === "ACTIVE" ? "Tạm dừng" : "Kích hoạt"}
                    </button>

                    <button
                      onClick={() => handleDeleteListing(item.id)}
                      className="text-xs font-bold text-red-600 hover:text-red-700 p-1"
                      title="Xóa dịch vụ"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Operational Modules */}
        <section>
          <div className="flex items-end justify-between border-b border-border-main pb-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[.14em] text-primary">
                Công cụ mở rộng
              </p>
              <h2 className="mt-2 text-2xl font-extrabold text-text-main">Không gian nghiệp vụ</h2>
            </div>
            <Store className="text-secondary" />
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {areas.map(({ href, icon: Icon, label, description }) => (
              <Link
                key={href}
                href={href}
                className="group rounded-[1.5rem] border border-border-main bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <Icon className="text-primary" size={22} />
                <h3 className="mt-5 flex items-center justify-between text-lg font-extrabold text-text-main">
                  {label}
                  <ArrowUpRight
                    size={18}
                    className="text-primary transition group-hover:-translate-y-1 group-hover:translate-x-1"
                  />
                </h3>
                <p className="mt-2 text-xs leading-5 text-text-sub">{description}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Create Listing Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border-main pb-4">
              <h3 className="text-lg font-bold text-text-main">Thêm dịch vụ / gói tour mới</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-text-sub hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-main">Tiêu đề dịch vụ *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Phòng Deluxe view núi - Sapa Mountain View..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border-main px-3.5 py-2 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-main">Phân loại *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PartnerListing["category"])}
                  className="mt-1 w-full rounded-xl border border-border-main bg-white px-3.5 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="STAY">Lưu trú (Khách sạn/Homestay)</option>
                  <option value="FOOD">Ẩm thực / Nhà hàng</option>
                  <option value="EXPERIENCE">Trải nghiệm / Tour phượt</option>
                  <option value="TRANSPORT">Thuê xe / Đưa đón</option>
                  <option value="EQUIPMENT">Thuê đồ cắm trại / Dã ngoại</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-main">Mô tả chi tiết *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Tiện nghi, dịch vụ bao gồm, lưu ý check-in..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border-main px-3.5 py-2 text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-main">Địa điểm *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Sa Pa, Lào Cai"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border-main px-3.5 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-main">Giá niêm yết (VND) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="650000"
                    value={priceAmount}
                    onChange={(e) => setPriceAmount(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border-main px-3.5 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-main">URL ảnh đại diện</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border-main px-3.5 py-2 text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-border-main px-4 py-2 text-xs font-semibold text-text-sub hover:bg-gray-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white hover:bg-primary-hover disabled:opacity-50"
                >
                  {submitting ? "Đang lưu..." : "Tạo dịch vụ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
