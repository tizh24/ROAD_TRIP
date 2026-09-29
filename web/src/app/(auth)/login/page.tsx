import LoginView from "@/features/auth/components/LoginView";
import { getSafeInternalPath } from "@/lib/auth/route-protection";

type LoginPageProps = {
  searchParams: Promise<{ authError?: string; next?: string }>;
};

export default async function Page({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = getSafeInternalPath(params.next) ?? undefined;

  return (
    <LoginView
      authError={
        params.authError === "callback" ||
        params.authError === "session_expired"
          ? params.authError
          : undefined
      }
      nextPath={nextPath}
    />
  );
}
