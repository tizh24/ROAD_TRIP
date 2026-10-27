"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { ArrowRight, Book, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getBillingOrder,
  listBillingOrders,
  type OrderRecord,
} from "@/features/billing/api/billing";

type Method = "VIETQR" | "MOMO" | "CREDIT_CARD";

const methods: { id: Method; title: string; hint: string }[] = [
  { id: "VIETQR", title: "Chuyển khoản VietQR (Mọi ngân hàng 24/7)", hint: "Quét mã QR tự động điền số tiền và nội dung" },
  { id: "MOMO", title: "Ví MoMo", hint: "Thanh toán nhanh qua ứng dụng MoMo" },
  { id: "CREDIT_CARD", title: "Thẻ Quốc Tế (Visa / Mastercard / JCB)", hint: "Bảo mật tiêu chuẩn PCI-DSS" },
];

const money = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)} ₫`;

function PaymentSkeleton() {
  return (
    <div className="page-shell max-w-3xl px-4 py-10 sm:px-6" aria-busy="true" aria-label="Đang tải">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="mt-8 h-24 rounded-lg" />
      <Skeleton className="mt-1 h-24 rounded-lg" />
    </div>
  );
}

function PaymentContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const [selectedMethod, setSelectedMethod] = useState<Method>("VIETQR");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(undefined);
      if (orderId) {
        const orderData = await getBillingOrder(orderId);
        setOrder(orderData);
        if (orderData.status === "COMPLETED") {
          setPaymentSuccess(true);
        }
      } else {
        const list = await listBillingOrders();
        setOrders([...list]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải thông tin đơn hàng.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadData(), 0);
    return () => window.clearTimeout(timer);
  }, [loadData]);

  if (loading) return <PaymentSkeleton />;

  if (!orderId || !order) {
    return (
      <div className="page-shell max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <header>
          <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">Các giao dịch của bạn</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Danh sách các đơn in Travel Book và dịch vụ đối tác bạn đã tạo.
          </p>
        </header>

        {error && (
          <p role="alert" className="mt-6 text-sm text-destructive">
            {error}
          </p>
        )}

        {orders.length === 0 ? (
          <div className="mt-8 flex flex-col items-center rounded-xl border border-dashed border-border px-6 py-14 text-center">
            <h2 className="text-lg font-medium">Chưa có giao dịch nào</h2>
            <p className="mt-1 text-sm text-muted-foreground">Bạn chưa có đơn đặt in Travel Book hoặc thanh toán nào đang chờ.</p>
            <Button asChild className="mt-6 min-h-11">
              <Link href="/trips">Về danh sách chuyến đi</Link>
            </Button>
          </div>
        ) : (
          <ul className="mt-8 grid gap-1">
            {orders.map((ord, index) => (
              <li
                key={ord.id}
                className={`flex flex-col justify-between gap-4 rounded-lg px-5 py-4 sm:flex-row sm:items-center ${index % 2 === 0 ? "bg-muted" : "bg-muted/50"}`}
              >
                <div className="min-w-0">
                  <h2 className="truncate text-base font-medium">{ord.title}</h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    <span className={ord.status === "COMPLETED" ? "text-success" : ""}>
                      {ord.status === "COMPLETED" ? "Đã thanh toán" : "Chờ thanh toán"}
                    </span>
                    {" · "}Ngày tạo: {new Date(ord.createdAt).toLocaleDateString("vi-VN")} · Mã đơn:{" "}
                    <span className="font-mono">{ord.id.slice(0, 8)}</span>
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-medium tabular-nums">{money(ord.amount)}</span>
                  {ord.status === "PENDING" && (
                    <Button asChild size="sm" className="min-h-11">
                      <Link href={`/payment?orderId=${ord.id}`}>
                        Thanh toán ngay <ArrowRight aria-hidden="true" />
                      </Link>
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="page-shell max-w-xl px-4 py-12 sm:py-16">
        <CheckCircle2 className="size-10 text-success" aria-hidden="true" />
        <h1 className="mt-4 text-3xl font-medium tracking-tight">Thanh toán thành công!</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Cảm ơn bạn. Đơn hàng đã được thanh toán và chuyển sang bộ phận in ấn & hoàn thiện.
        </p>

        <dl className="mt-8 grid gap-1 text-sm">
          {[
            ["Mã đơn hàng", <span key="id" className="break-all font-mono">{order.id}</span>],
            ["Nội dung", order.title],
            ["Số tiền đã trả", <span key="amount" className="tabular-nums">{money(order.amount)}</span>],
            ["Phương thức", order.paymentMethod || selectedMethod],
            ["Mã giao dịch", <span key="ref" className="font-mono">{order.paymentRef || "Chưa được cung cấp"}</span>],
          ].map(([label, value], index) => (
            <div key={String(label)} className={`flex justify-between gap-4 rounded-lg px-4 py-3 ${index % 2 === 0 ? "bg-muted" : "bg-muted/50"}`}>
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="text-right font-medium">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {order.itemType === "TRAVEL_BOOK" && order.itemId && (
            <Button asChild className="min-h-11">
              <Link href={`/travel-book/${order.itemId}`}>
                <Book aria-hidden="true" /> Xem trạng thái Travel Book
              </Link>
            </Button>
          )}
          <Button asChild variant="outline" className="min-h-11">
            <Link href="/dashboard">Về bảng điều khiển</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell max-w-xl px-4 py-8 sm:px-6 sm:py-12">
      <header>
        <p className="text-sm text-muted-foreground">Cổng thanh toán an toàn</p>
        <h1 className="mt-1 text-3xl font-medium tracking-tight">{order.title}</h1>
        <dl className="mt-6">
          <dt className="text-sm text-muted-foreground">Tổng số tiền cần thanh toán</dt>
          <dd className="mt-1 text-4xl font-medium tabular-nums tracking-tight">{money(order.amount)}</dd>
        </dl>
      </header>

      <fieldset className="mt-10">
        <legend className="text-sm font-medium">Chọn phương thức thanh toán</legend>
        <div className="mt-3 grid gap-1">
          {methods.map((method) => (
            <label
              key={method.id}
              className="flex min-h-16 cursor-pointer items-center justify-between gap-4 rounded-lg bg-muted px-5 py-3 transition-colors hover:bg-border has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring"
            >
              <span className="min-w-0">
                <span className="block text-sm font-medium">{method.title}</span>
                <span className="block text-sm opacity-70">{method.hint}</span>
              </span>
              <input
                type="radio"
                name="payment-method"
                value={method.id}
                checked={selectedMethod === method.id}
                onChange={() => setSelectedMethod(method.id)}
                className="size-4 shrink-0 accent-primary"
              />
            </label>
          ))}
        </div>
        {selectedMethod === "VIETQR" && (
          <p className="mt-3 rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
            Thông tin chuyển khoản sẽ hiển thị khi cổng thanh toán được kết nối.
          </p>
        )}
      </fieldset>

      <div className="mt-8">
        <Button type="button" disabled size="lg" className="min-h-12 w-full">
          <ShieldCheck aria-hidden="true" />
          Chờ cổng thanh toán được kết nối
        </Button>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Đơn chỉ được hoàn tất sau webhook có chữ ký hợp lệ từ nhà cung cấp thanh toán.
        </p>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<PaymentSkeleton />}>
      <PaymentContent />
    </Suspense>
  );
}
