"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  Book,
  CheckCircle2,
  CreditCard,
  QrCode,
  Receipt,
  ShieldCheck,
  Smartphone,
  Wallet,
} from "lucide-react";
import {
  getBillingOrder,
  listBillingOrders,
  type OrderRecord,
} from "@/features/billing/api/billing";

function PaymentContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string>();

  const [selectedMethod, setSelectedMethod] = useState<"VIETQR" | "MOMO" | "CREDIT_CARD">("VIETQR");
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

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-muted">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // If no specific orderId, display recent orders
  if (!orderId || !order) {
    return (
      <div className="min-h-screen bg-muted px-4 py-8 text-foreground sm:px-6 sm:py-12">
        <div className="page-shell max-w-4xl px-0">
          <div className="flex items-center gap-2 text-primary font-bold text-xs">
            <Receipt size={16} />
            <span>LỊCH SỬ ĐƠN HÀNG & THANH TOÁN</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-foreground sm:text-3xl">
            Các Giao Dịch Của Bạn
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Danh sách các đơn in Travel Book và dịch vụ đối tác bạn đã tạo.
          </p>

          {orders.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
              <Wallet className="mx-auto text-primary" size={40} />
              <h3 className="mt-3 text-base font-bold text-foreground">Chưa có giao dịch nào</h3>
              <p className="mt-1 text-xs">
                Bạn chưa có đơn đặt in Travel Book hoặc thanh toán nào đang chờ.
              </p>
              <Link
                href="/trips"
                className="mt-6 inline-flex rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary/90"
              >
                Về danh sách chuyến đi
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm"
                >
                  <div>
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        ord.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-800"
                          : ord.status === "PENDING"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {ord.status === "COMPLETED" ? "Đã thanh toán" : "Chờ thanh toán"}
                    </span>
                    <h3 className="mt-2 text-base font-bold text-foreground">{ord.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      Ngày tạo: {new Date(ord.createdAt).toLocaleDateString("vi-VN")} • Mã đơn:{" "}
                      <span className="font-mono">{ord.id.slice(0, 8)}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-base font-black text-primary">
                        {new Intl.NumberFormat("vi-VN").format(ord.amount)} ₫
                      </div>
                    </div>

                    {ord.status === "PENDING" && (
                      <Link
                        href={`/payment?orderId=${ord.id}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary/90"
                      >
                        Thanh toán ngay <ArrowRight size={14} />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted px-4 py-8 text-foreground sm:px-6 sm:py-12">
      <div className="mx-auto max-w-2xl">
        {paymentSuccess ? (
          /* Receipt Success State */
          <div className="rounded-3xl border border-emerald-200 bg-card p-8 text-center shadow-lg animate-in fade-in zoom-in-95">
            <CheckCircle2 className="mx-auto text-emerald-600" size={56} />
            <h1 className="mt-4 text-2xl font-black text-foreground">
              Thanh Toán Thành Công!
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Cảm ơn bạn. Đơn hàng đã được thanh toán và chuyển sang bộ phận in ấn & hoàn thiện.
            </p>

            <div className="mt-6 rounded-2xl bg-muted p-5 text-left text-xs space-y-2.5 border border-border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mã đơn hàng:</span>
                <span className="font-mono font-bold text-foreground">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nội dung:</span>
                <span className="font-bold text-foreground">{order.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Số tiền đã trả:</span>
                <span className="font-bold text-emerald-700">
                  {new Intl.NumberFormat("vi-VN").format(order.amount)} ₫
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phương thức:</span>
                <span className="font-bold text-foreground">{order.paymentMethod || selectedMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mã giao dịch:</span>
                <span className="font-mono text-muted-foreground">{order.paymentRef || "Chưa được cung cấp"}</span>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              {order.itemType === "TRAVEL_BOOK" && order.itemId && (
                <Link
                  href={`/travel-book/${order.itemId}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white hover:bg-primary/90 shadow-md"
                >
                  <Book size={15} /> Xem trạng thái Travel Book
                </Link>
              )}
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-5 py-2.5 text-xs font-semibold text-foreground hover:bg-gray-50"
              >
                Về bảng điều khiển
              </Link>
            </div>
          </div>
        ) : (
          /* Checkout Payment Form */
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-md">
            {/* Order Header */}
            <div className="border-b border-border bg-primary p-6 text-white sm:p-8">
              <span className="rounded-full bg-primary/20 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#f2c369]">
                Cổng Thanh Toán An Toàn
              </span>
              <h1 className="mt-3 text-xl font-bold sm:text-2xl">{order.title}</h1>
              <div className="mt-4 flex items-baseline justify-between border-t border-white/10 pt-4">
                <span className="text-xs text-white/70">Tổng số tiền cần thanh toán:</span>
                <span className="text-2xl font-black text-[#f2c369]">
                  {new Intl.NumberFormat("vi-VN").format(order.amount)} ₫
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
                  Chọn phương thức thanh toán
                </label>

                <div className="mt-3 space-y-3">
                  {/* VietQR */}
                  <div
                    onClick={() => setSelectedMethod("VIETQR")}
                    className={`cursor-pointer rounded-2xl border p-4 transition ${
                      selectedMethod === "VIETQR"
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-blue-100 p-2 text-blue-700">
                          <QrCode size={20} />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-foreground">
                            Chuyển khoản VietQR (Mọi ngân hàng 24/7)
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            Quét mã QR tự động điền số tiền và nội dung
                          </div>
                        </div>
                      </div>
                      <input
                        type="radio"
                        checked={selectedMethod === "VIETQR"}
                        onChange={() => setSelectedMethod("VIETQR")}
                        className="text-primary"
                      />
                    </div>

                    {selectedMethod === "VIETQR" && (
                      <p className="mt-3 rounded-xl border border-dashed border-border p-3 text-[11px] text-muted-foreground">
                        Thông tin chuyển khoản sẽ hiển thị khi cổng thanh toán được kết nối.
                      </p>
                    )}
                  </div>

                  {/* MoMo */}
                  <div
                    onClick={() => setSelectedMethod("MOMO")}
                    className={`cursor-pointer rounded-2xl border p-4 transition ${
                      selectedMethod === "MOMO"
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-pink-100 p-2 text-pink-700">
                          <Smartphone size={20} />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-foreground">Ví MoMo</div>
                          <div className="text-[11px] text-muted-foreground">
                            Thanh toán nhanh qua ứng dụng MoMo
                          </div>
                        </div>
                      </div>
                      <input
                        type="radio"
                        checked={selectedMethod === "MOMO"}
                        onChange={() => setSelectedMethod("MOMO")}
                        className="text-primary"
                      />
                    </div>
                  </div>

                  {/* Card */}
                  <div
                    onClick={() => setSelectedMethod("CREDIT_CARD")}
                    className={`cursor-pointer rounded-2xl border p-4 transition ${
                      selectedMethod === "CREDIT_CARD"
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
                          <CreditCard size={20} />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-foreground">
                            Thẻ Quốc Tế (Visa / Mastercard / JCB)
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            Bảo mật tiêu chuẩn PCI-DSS
                          </div>
                        </div>
                      </div>
                      <input
                        type="radio"
                        checked={selectedMethod === "CREDIT_CARD"}
                        onChange={() => setSelectedMethod("CREDIT_CARD")}
                        className="text-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled
                  className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-2xl bg-slate-400 py-4 text-sm font-bold text-white shadow-md disabled:opacity-70"
                >
                  <ShieldCheck size={18} />
                  Chờ cổng thanh toán được kết nối
                </button>
                <p className="mt-2 text-center text-[11px] text-muted-foreground">
                  Đơn chỉ được hoàn tất sau webhook có chữ ký hợp lệ từ nhà cung cấp thanh toán.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center bg-muted">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
