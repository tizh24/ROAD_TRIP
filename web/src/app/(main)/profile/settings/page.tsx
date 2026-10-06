import Link from "next/link";
import { Bell, LockKeyhole, MapPin, Settings, UserRound } from "lucide-react";

const groups = [
  { icon: UserRound, title: "Hồ sơ", description: "Tên hiển thị, ảnh đại diện và giới thiệu sẽ xuất hiện ở đây khi hồ sơ có thể chỉnh sửa." },
  { icon: Bell, title: "Thông báo", description: "Tuỳ chọn cập nhật chuyến đi và lời mời đang được chuẩn bị." },
  { icon: MapPin, title: "Vị trí & riêng tư", description: "Kiểm soát vị trí và khả năng hiển thị hành trình sẽ được quản lý tại đây." },
  { icon: LockKeyhole, title: "Bảo mật", description: "Thay đổi mật khẩu hiện được quản lý bởi nhà cung cấp đăng nhập của bạn." },
] as const;

export default function ProfileSettingsPage() {
  return <main className="min-h-screen bg-background-warm px-4 py-10 text-text-main sm:px-6"><div className="page-shell max-w-3xl px-0"><Link href="/profile" className="focus-ring text-sm font-bold text-primary hover:underline">← Hồ sơ</Link><header className="mt-5"><p className="text-xs font-extrabold uppercase tracking-[.14em] text-primary">Tài khoản</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Cài đặt hồ sơ</h1><p className="mt-3 text-sm leading-6 text-text-sub">Các mục dưới đây cho biết những phần sẽ có mặt khi hệ thống cài đặt được kết nối.</p></header><section className="surface-card mt-8 divide-y divide-border-main">{groups.map(({ icon: Icon, title, description }) => <div key={title} className="flex gap-4 p-5 sm:p-6"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon size={19} /></span><div><h2 className="font-extrabold">{title}</h2><p className="mt-1 text-sm leading-6 text-text-sub">{description}</p><span className="mt-3 inline-block rounded-full bg-background-warm px-3 py-1 text-xs font-bold text-text-sub">Chưa khả dụng</span></div></div>)}</section><div className="mt-6 flex items-center gap-3 rounded-2xl border border-border-main bg-surface p-4 text-sm text-text-sub"><Settings size={18} className="text-secondary" />Không có thay đổi nào để lưu trong phiên bản hiện tại.</div></div></main>;
}
