import Link from "next/link";
import { requireAuthenticatedUser } from "@/lib/auth/authorization";
import { gatewayProfile } from "@/lib/api/gateway-server";
import ProfileSettingsForm from "@/features/auth/components/ProfileSettingsForm";

export default async function ProfileSettingsPage() {
  const user = await requireAuthenticatedUser("/profile/settings");
  const profile = await gatewayProfile();

  return (
    <div className="page-shell max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <Link href="/profile" className="focus-ring inline-flex min-h-11 items-center rounded text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
        ← Hồ sơ
      </Link>
      <header className="mt-4">
        <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">Cài đặt hồ sơ</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">Quản lý thông tin cơ bản và bảo mật tài khoản của bạn.</p>
      </header>
      <ProfileSettingsForm fullName={profile.data?.fullName ?? ""} email={profile.data?.email ?? user.email ?? ""} />
    </div>
  );
}
