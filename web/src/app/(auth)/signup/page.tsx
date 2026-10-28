import AccountAccessView from "@/features/auth/components/AccountAccessView";
import { getSafeInternalPath } from "@/lib/auth/route-protection";

export const metadata = { title: "Tạo tài khoản" };

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  return <AccountAccessView mode="signup" nextPath={getSafeInternalPath(params.next) ?? undefined} />;
}
