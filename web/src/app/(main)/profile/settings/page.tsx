import Link from "next/link";
import { requireAuthenticatedUser } from "@/lib/auth/authorization";
import { gatewayProfile } from "@/lib/api/gateway-server";
import ProfileSettingsForm from "@/features/auth/components/ProfileSettingsForm";

export default async function ProfileSettingsPage() {
  const user = await requireAuthenticatedUser("/profile/settings");
  const profile = await gatewayProfile();

  return <div className="min-h-screen bg-muted px-4 py-10 text-foreground sm:px-6"><div className="page-shell max-w-3xl px-0"><Link href="/profile" className="focus-ring inline-flex min-h-11 items-center text-sm font-bold text-primary hover:underline">← Hồ sơ</Link><header className="mt-5"><h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Cài đặt hồ sơ</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Quản lý thông tin cơ bản và bảo mật tài khoản của bạn.</p></header><ProfileSettingsForm fullName={profile.data?.fullName ?? ""} email={profile.data?.email ?? user.email ?? ""} /></div></div>;
}
