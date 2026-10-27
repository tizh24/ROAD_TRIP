"use client";

import Link from "next/link";
import { ArrowRight, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UserProfileView() {
  return (
    <div className="page-shell px-4 py-8 sm:px-6 sm:py-10">
      <header>
        <h1 className="max-w-2xl text-3xl font-medium tracking-tight sm:text-4xl">
          Nơi những hành trình
          <br />
          thuộc về bạn.
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Hồ sơ sẽ phản ánh những chuyến đi, câu chuyện và mức riêng tư bạn chọn chia sẻ.
        </p>
      </header>

      <div className="mt-12 grid gap-10 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="h-fit rounded-xl bg-muted p-6">
          <div className="flex size-14 items-center justify-center rounded-lg bg-primary text-xl font-medium text-primary-foreground" aria-hidden="true">RT</div>
          <h2 className="mt-5 text-xl font-medium">Hồ sơ của bạn</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Thông tin công khai và avatar sẽ được hiển thị khi profile editing được kết nối.
          </p>
          <Link href="/profile/settings" className="focus-ring mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-medium underline underline-offset-4">
            <Settings className="size-4" aria-hidden="true" /> Cài đặt hồ sơ
          </Link>
        </aside>

        <div className="space-y-10">
          <section aria-labelledby="profile-trips">
            <h2 id="profile-trips" className="text-2xl font-medium tracking-tight">Những gì bạn đang lên kế hoạch.</h2>
            <p className="mt-3 text-sm text-muted-foreground">Danh sách thực tế của bạn luôn ở My Journeys.</p>
            <Button asChild className="mt-5 min-h-11">
              <Link href="/trips">
                Mở My Journeys <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </section>

          <dl className="grid gap-1">
            <div className="rounded-lg bg-muted px-5 py-4">
              <dt className="text-base font-medium">Chuyến đi của tôi</dt>
              <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Tạo, tiếp tục và quản lý các lịch trình mà bạn có quyền truy cập.{" "}
                <Link href="/trips" className="focus-ring font-medium text-foreground underline underline-offset-4">Xem hành trình</Link>
              </dd>
            </div>
            <div className="rounded-lg bg-muted/50 px-5 py-4">
              <dt className="text-base font-medium">Đã lưu</dt>
              <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Tính năng lưu lộ trình công khai chưa được kết nối trong phiên bản này. Chưa khả dụng.
              </dd>
            </div>
          </dl>

          <p className="text-sm text-muted-foreground">
            Các thiết lập riêng tư, vị trí và dữ liệu tài khoản được quản lý trong Settings.
          </p>
        </div>
      </div>
    </div>
  );
}
