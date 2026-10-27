"use client";
import { toast } from "@/components/ui/sonner";

import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
      toast.error("Vui lòng nhập đầy đủ thông tin giao nhận sách.");
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
      toast.error(err instanceof Error ? err.message : "Không thể tạo đơn đặt sách.");
    } finally {
      setOrdering(false);
    }
  };

  if (loading) {
    return (
      <div className="page-shell max-w-5xl px-4 py-10 sm:px-6" aria-busy="true" aria-label="Đang tải">
        <Skeleton className="h-9 w-72" />
        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          <Skeleton className="aspect-[3/4] rounded-xl lg:col-span-5" />
          <Skeleton className="h-96 rounded-xl lg:col-span-7" />
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="page-shell max-w-md px-4 py-20 text-center">
        <h2 className="text-xl font-medium">Không thể mở Travel Book</h2>
        <p className="mt-2 text-sm text-muted-foreground">{error || "Hành trình chưa có kỷ niệm để tạo sách."}</p>
        <Button type="button" className="mt-6 min-h-11" onClick={() => router.back()}>
          Quay lại
        </Button>
      </div>
    );
  }

  const selectedPricing = formatPricing[format];
  const money = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)} ₫`;

  return (
    <div className="page-shell max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="focus-ring inline-flex min-h-11 items-center gap-1.5 rounded text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Quay lại kỷ niệm chuyến đi
        </button>
        {book.status !== "DRAFT" && (
          <p className="inline-flex items-center gap-2 text-sm text-success">
            <CheckCircle2 className="size-4" aria-hidden="true" />
            Trạng thái: Đã đặt in ({book.status})
          </p>
        )}
      </div>

      <header className="mt-4">
        <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">In ấn kỷ niệm hành trình</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Biến toàn bộ hình ảnh, toạ độ cung đường và nhật ký thành một cuốn sách ảnh cầm tay.
        </p>
      </header>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
        <aside className="lg:col-span-5">
          <div className="lg:sticky lg:top-6">
            <p className="text-sm text-muted-foreground">Mô phỏng bản in thực tế ({format})</p>
            <div className="relative mt-3 flex aspect-[3/4] w-full flex-col justify-between overflow-hidden rounded-xl bg-primary p-6 text-primary-foreground">
              {coverPhotoUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- a travel-book cover can reference user-uploaded media from variable hosts.
                <img src={coverPhotoUrl} alt="Cover" className="absolute inset-0 h-full w-full object-cover opacity-35 mix-blend-overlay" />
              )}
              <div className="relative z-10 flex items-center justify-between text-xs opacity-80">
                <span className="tracking-widest">TRIPZ EDITION</span>
                <span className="tabular-nums">{book.pageCount} PAGES</span>
              </div>
              <div className="relative z-10 my-auto text-center">
                <h2 className="text-3xl font-medium tracking-tight">{title || "Tên chuyến đi"}</h2>
                {subtitle && <p className="mx-auto mt-2 max-w-xs text-sm italic opacity-80">{subtitle}</p>}
              </div>
              <div className="relative z-10 border-t border-primary-foreground/20 pt-3 text-center text-xs opacity-60">Tuyển tập kỷ niệm phượt</div>
            </div>

            <dl className="mt-4 grid gap-1 text-sm">
              {[
                ["Quy cách in", selectedPricing.label],
                ["Số trang", `${book.pageCount} trang màu cao cấp`],
                ["Đóng gói", "Hộp quà tặng Tripz bảo vệ"],
              ].map(([label, value], index) => (
                <div key={label} className={`flex justify-between gap-4 rounded-lg px-4 py-3 ${index % 2 === 0 ? "bg-muted" : "bg-muted/50"}`}>
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="text-right font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>

        <form onSubmit={handleOrder} className="space-y-10 lg:col-span-7">
          <fieldset>
            <legend className="text-lg font-medium">1. Chọn định dạng xuất bản</legend>
            <div className="mt-4 grid grid-cols-1 gap-1 sm:grid-cols-3 sm:gap-2">
              {(Object.keys(formatPricing) as Array<keyof typeof formatPricing>).map((fmtKey) => {
                const item = formatPricing[fmtKey];
                return (
                  <label
                    key={fmtKey}
                    className="flex cursor-pointer flex-col rounded-lg bg-muted p-4 transition-colors hover:bg-border has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring"
                  >
                    <input type="radio" name="book-format" value={fmtKey} checked={format === fmtKey} onChange={() => setFormat(fmtKey)} className="sr-only" />
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="mt-2 text-xl tabular-nums">{money(item.price)}</span>
                    <span className="mt-1 text-xs leading-snug opacity-70">{item.desc}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-lg font-medium">2. Tuỳ chỉnh bìa và tiêu đề</legend>
            <div className="pt-1">
              <label htmlFor="tb-title" className="block text-sm font-medium">Tên sách in *</label>
              <Input id="tb-title" type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="mt-2 h-11" />
            </div>
            <div>
              <label htmlFor="tb-subtitle" className="block text-sm font-medium">Tiêu đề phụ / Lời đề tựa</label>
              <Input id="tb-subtitle" type="text" placeholder="Ví dụ: Cung đường hạnh phúc 2026..." value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="mt-2 h-11" />
            </div>
            <div>
              <label htmlFor="tb-cover" className="block text-sm font-medium">URL ảnh bìa (tuỳ chọn)</label>
              <Input id="tb-cover" type="url" placeholder="https://..." value={coverPhotoUrl} onChange={(e) => setCoverPhotoUrl(e.target.value)} className="mt-2 h-11" />
            </div>
          </fieldset>

          {format !== "DIGITAL_PDF" && (
            <fieldset className="space-y-4">
              <legend className="text-lg font-medium">3. Địa chỉ giao nhận sách in</legend>
              <div className="grid grid-cols-1 gap-4 pt-1 sm:grid-cols-2">
                <div>
                  <label htmlFor="tb-name" className="block text-sm font-medium">Họ tên người nhận *</label>
                  <Input id="tb-name" type="text" required placeholder="Nguyễn Văn A" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className="mt-2 h-11" />
                </div>
                <div>
                  <label htmlFor="tb-phone" className="block text-sm font-medium">Số điện thoại *</label>
                  <Input id="tb-phone" type="tel" required placeholder="0912345678" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-2 h-11" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label htmlFor="tb-address" className="block text-sm font-medium">Địa chỉ nhà / số đường *</label>
                  <Input id="tb-address" type="text" required placeholder="Số 45 ngõ 12 Đường Cầu Giấy..." value={address} onChange={(e) => setAddress(e.target.value)} className="mt-2 h-11" />
                </div>
                <div>
                  <label htmlFor="tb-city" className="block text-sm font-medium">Tỉnh / Thành phố *</label>
                  <Input id="tb-city" type="text" required value={city} onChange={(e) => setCity(e.target.value)} className="mt-2 h-11" />
                </div>
              </div>
            </fieldset>
          )}

          <div className="flex flex-col justify-between gap-4 rounded-xl bg-muted p-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm text-muted-foreground">Tổng tiền thanh toán</p>
              <p className="text-3xl font-medium tabular-nums tracking-tight">{money(selectedPricing.price)}</p>
              <p className="text-sm text-success">Miễn phí vận chuyển toàn quốc</p>
            </div>
            <Button type="submit" size="lg" disabled={ordering || !title.trim()} className="min-h-12">
              <CreditCard aria-hidden="true" />
              {ordering ? "Đang xử lý..." : "Tiến hành thanh toán"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
