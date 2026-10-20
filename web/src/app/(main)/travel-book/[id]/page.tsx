"use client";

import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Book,
  BookOpen,
  CheckCircle2,
  CreditCard,
  FileText,
  Sparkles,
  Truck,
} from "lucide-react";
import {
  createBillingOrder,
  getOrCreateTravelBook,
  updateTravelBook,
  type TravelBookRecord,
} from "@/features/billing/api/billing";

const formatPricing = {
  DIGITAL_PDF: { price: 99000, label: "Bản Kỹ Thuật Số (PDF)", desc: "Tải về tức thì, sắc nét cho iPad/Laptop" },
  SOFTCOVER: { price: 299000, label: "Bìa Mềm Tinh Tế", desc: "Khổ vuông 20x20cm, giấy mỹ thuật 200gsm" },
  HARDCOVER: { price: 499000, label: "Bìa Cứng Sang Trọng", desc: "Bìa bọc vải ép nhũ kim, đóng gáy thủ công" },
};

export default function TravelBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const targetId = resolvedParams.id;

  const [book, setBook] = useState<TravelBookRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  // Customization fields
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [format, setFormat] = useState<TravelBookRecord["format"]>("HARDCOVER");
  const [coverPhotoUrl, setCoverPhotoUrl] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Hà Nội");
  const [ordering, setOrdering] = useState(false);

  const loadBook = useCallback(async () => {
    try {
      setLoading(true);
      setError(undefined);
      const data = await getOrCreateTravelBook(targetId);
      setBook(data);
      setTitle(data.title || "");
      setSubtitle(data.subtitle || "");
      setFormat(data.format || "HARDCOVER");
      setCoverPhotoUrl(data.coverPhotoUrl || "");
      if (data.shippingAddress) {
        setRecipientName(data.shippingAddress.recipientName || "");
        setPhone(data.shippingAddress.phone || "");
        setAddress(data.shippingAddress.address || "");
        setCity(data.shippingAddress.city || "Hà Nội");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải thông tin Travel Book.");
    } finally {
      setLoading(false);
    }
  }, [targetId]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadBook(), 0);
    return () => window.clearTimeout(timer);
  }, [loadBook]);

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!book) return;

    if (format !== "DIGITAL_PDF" && (!recipientName.trim() || !phone.trim() || !address.trim())) {
      alert("Vui lòng nhập đầy đủ thông tin giao nhận sách.");
      return;
    }

    try {
      setOrdering(true);
      const price = formatPricing[format].price;
      // 1. Save customization
      await updateTravelBook(book.id, {
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        format,
        coverPhotoUrl: coverPhotoUrl.trim() || null,
        shippingAddress: {
          recipientName: recipientName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          city,
        },
      });

      // 2. Create order
      const order = await createBillingOrder({
        itemType: "TRAVEL_BOOK",
        itemId: book.id,
        title: `Travel Book: ${title.trim()}`,
        amount: price,
        tripId: book.tripId,
        metadata: {
          format,
          pageCount: book.pageCount,
          recipientName,
        },
      });

      // 3. Redirect to payment checkout
      router.push(`/payment?orderId=${order.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không thể tạo đơn đặt sách.");
    } finally {
      setOrdering(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-background-warm">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </main>
    );
  }

  if (error || !book) {
    return (
      <main className="min-h-screen bg-background-warm px-4 py-12 text-center">
        <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-sm">
          <Book className="mx-auto text-red-500" size={40} />
          <h2 className="mt-3 text-lg font-bold text-text-main">Không thể mở Travel Book</h2>
          <p className="mt-1 text-xs text-text-sub">{error || "Hành trình chưa có kỷ niệm để tạo sách."}</p>
          <button
            onClick={() => router.back()}
            className="mt-6 inline-flex rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover"
          >
            Quay lại
          </button>
        </div>
      </main>
    );
  }

  const selectedPricing = formatPricing[format];

  return (
    <main className="min-h-screen bg-background-warm px-4 py-8 text-text-main sm:px-6 sm:py-12">
      <div className="page-shell max-w-5xl px-0">
        {/* Back Link */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-text-sub hover:text-text-main transition"
          >
            <ArrowLeft size={16} /> Quay lại kỷ niệm chuyến đi
          </button>

          {book.status !== "DRAFT" && (
            <div className="flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
              <CheckCircle2 size={14} />
              <span>Trạng thái: Đã đặt in ({book.status})</span>
            </div>
          )}
        </div>

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-primary font-bold text-xs">
              <Sparkles size={15} />
              <span>TRIPZ TRAVEL BOOK FULFILLMENT</span>
            </div>
            <h1 className="mt-1 text-2xl font-black text-text-main sm:text-3xl">
              In Ấn Kỷ Niệm Hành Trình
            </h1>
            <p className="mt-1 text-xs text-text-sub">
              Biến toàn bộ hình ảnh, toạ độ cung đường và nhật ký thành một cuốn sách ảnh nghệ thuật cầm tay.
            </p>
          </div>
        </div>

        {/* Main Grid: Preview on Left, Customizer on Right */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left: Interactive Book Mockup Preview */}
          <div className="lg:col-span-5 space-y-6">
            <div className="sticky top-6">
              <div className="overflow-hidden rounded-3xl border border-border-main bg-white p-6 shadow-md">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-text-sub">
                  Mô phỏng bản in thực tế ({format})
                </p>

                {/* Hardcover book visual */}
                <div className="mt-4 flex aspect-[3/4] w-full flex-col justify-between rounded-2xl bg-gradient-to-br from-[#1d2a23] to-[#0f1712] p-6 text-white shadow-xl relative overflow-hidden">
                  {coverPhotoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element -- a travel-book cover can reference user-uploaded media from variable hosts.
                    <img
                      src={coverPhotoUrl}
                      alt="Cover"
                      className="absolute inset-0 h-full w-full object-cover opacity-35 mix-blend-overlay"
                    />
                  )}
                  <div className="relative z-10 flex items-center justify-between text-xs font-bold text-[#f2c369]">
                    <span className="tracking-widest">TRIPZ EDITION</span>
                    <span>{book.pageCount} PAGES</span>
                  </div>

                  <div className="relative z-10 my-auto text-center">
                    <h2 className="font-serif text-2xl font-black tracking-tight sm:text-3xl">
                      {title || "Tên Chuyến Đi"}
                    </h2>
                    {subtitle && (
                      <p className="mt-2 text-xs italic text-white/80 max-w-xs mx-auto">
                        {subtitle}
                      </p>
                    )}
                  </div>

                  <div className="relative z-10 border-t border-white/20 pt-3 text-center text-[10px] text-white/60 uppercase tracking-widest">
                    Tuyển tập kỷ niệm phượt
                  </div>
                </div>

                {/* Inside details summary */}
                <div className="mt-5 rounded-2xl bg-background-warm p-4 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-text-sub">Quy cách in:</span>
                    <strong className="text-text-main">{selectedPricing.label}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-sub">Số trang:</span>
                    <strong className="text-text-main">{book.pageCount} trang màu cao cấp</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-sub">Đóng gói:</span>
                    <strong className="text-text-main">Hộp quà tặng Tripz bảo vệ</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Customization Form & Checkout CTA */}
          <div className="lg:col-span-7">
            <form onSubmit={handleOrder} className="space-y-6">
              {/* Step 1: Format Selector */}
              <div className="rounded-3xl border border-border-main bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-text-main flex items-center gap-2">
                  <BookOpen size={18} className="text-primary" />
                  1. Chọn định dạng xuất bản
                </h3>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {(Object.keys(formatPricing) as Array<keyof typeof formatPricing>).map((fmtKey) => {
                    const item = formatPricing[fmtKey];
                    const isSelected = format === fmtKey;
                    return (
                      <div
                        key={fmtKey}
                        onClick={() => setFormat(fmtKey)}
                        className={`cursor-pointer rounded-2xl border p-4 transition ${
                          isSelected
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-border-main hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-text-main">{item.label}</span>
                          {isSelected && <CheckCircle2 size={16} className="text-primary" />}
                        </div>
                        <div className="mt-2 text-base font-black text-primary">
                          {new Intl.NumberFormat("vi-VN").format(item.price)} ₫
                        </div>
                        <p className="mt-1 text-[11px] text-text-sub leading-tight">{item.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Book Title and Cover */}
              <div className="rounded-3xl border border-border-main bg-white p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-text-main flex items-center gap-2">
                  <FileText size={18} className="text-primary" />
                  2. Tuỳ chỉnh bìa và tiêu đề
                </h3>

                <div>
                  <label className="block text-xs font-bold text-text-main">Tên sách in *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border-main px-3.5 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-main">Tiêu đề phụ / Lời đề tựa</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Cung đường hạnh phúc 2026..."
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border-main px-3.5 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-main">URL ảnh bìa (tuỳ chọn)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={coverPhotoUrl}
                    onChange={(e) => setCoverPhotoUrl(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border-main px-3.5 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Step 3: Shipping Address (if physical book) */}
              {format !== "DIGITAL_PDF" && (
                <div className="rounded-3xl border border-border-main bg-white p-6 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-text-main flex items-center gap-2">
                    <Truck size={18} className="text-primary" />
                    3. Địa chỉ giao nhận sách in
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-text-main">Họ tên người nhận *</label>
                      <input
                        type="text"
                        required
                        placeholder="Nguyễn Văn A"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-border-main px-3.5 py-2 text-sm outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-main">Số điện thoại *</label>
                      <input
                        type="tel"
                        required
                        placeholder="0912345678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-border-main px-3.5 py-2 text-sm outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-text-main">Địa chỉ nhà / số đường *</label>
                      <input
                        type="text"
                        required
                        placeholder="Số 45 ngõ 12 Đường Cầu Giấy..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-border-main px-3.5 py-2 text-sm outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-main">Tỉnh / Thành phố *</label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-border-main px-3.5 py-2 text-sm outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Order Summary & Submit */}
              <div className="rounded-3xl border border-border-main bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-text-sub">Tổng tiền thanh toán:</span>
                  <div className="text-2xl font-black text-primary">
                    {new Intl.NumberFormat("vi-VN").format(selectedPricing.price)} ₫
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold">
                    Miễn phí vận chuyển toàn quốc
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={ordering || !title.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-7 py-3.5 text-sm font-bold text-white shadow-md hover:bg-primary-hover active:scale-95 disabled:opacity-50 transition"
                >
                  <CreditCard size={18} />
                  {ordering ? "Đang xử lý..." : "Tiến hành thanh toán"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
