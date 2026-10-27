import Link from "next/link";

export const metadata = { title: "Thanh toán và hoá đơn" };

export default function ProfileBillingPage() {
  return (
    <div className="page-shell max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <Link href="/profile" className="focus-ring inline-flex min-h-11 items-center rounded text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
        ← Hồ sơ
      </Link>
      <header className="mt-4">
        <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">Thanh toán & hoá đơn</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Chưa có cổng thanh toán hoặc gói trả phí nào được kích hoạt trong sản phẩm hiện tại.
        </p>
      </header>

      <section aria-labelledby="billing-status" className="mt-10">
        <h2 id="billing-status" className="text-lg font-medium">Trạng thái thanh toán</h2>
        <p className="mt-1 text-sm text-muted-foreground">Chưa có phương thức thanh toán được liên kết.</p>
        <dl className="mt-5 grid gap-1">
          <div className="rounded-lg bg-muted px-5 py-4">
            <dt className="text-sm text-muted-foreground">Gói hiện tại</dt>
            <dd className="mt-1">Không có gói trả phí đang hoạt động.</dd>
          </div>
          <div className="rounded-lg bg-muted/50 px-5 py-4">
            <dt className="text-sm text-muted-foreground">Hoá đơn</dt>
            <dd className="mt-1">Chưa có hoá đơn để hiển thị.</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
