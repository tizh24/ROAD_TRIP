import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAuthenticatedUser } from "@/lib/auth/authorization";
import ProfileSettingsForm from "@/features/auth/components/ProfileSettingsForm";

export default async function ProfileSettingsPage() {
  const user = await requireAuthenticatedUser("/profile/settings");
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  return <main className="min-h-screen bg-background-warm px-4 py-10 text-text-main sm:px-6"><div className="page-shell max-w-3xl px-0"><Link href="/profile" className="focus-ring inline-flex min-h-11 items-center text-sm font-bold text-primary hover:underline">← Hồ sơ</Link><header className="mt-5"><h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Cài đặt hồ sơ</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-text-sub">Quản lý thông tin cơ bản và bảo mật tài khoản của bạn.</p></header><ProfileSettingsForm fullName={profile?.full_name ?? user.user_metadata.full_name ?? ""} email={profile?.email ?? user.email ?? ""} /></div></main>;
}
