import LoginView from "@/features/auth/components/LoginView";

type LoginPageProps = {
  searchParams: Promise<{ authError?: string; next?: string }>;
};

export default async function Page({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath =
    params.next?.startsWith("/") && !params.next.startsWith("//")
      ? params.next
      : undefined;

  return (
    <LoginView
      callbackError={params.authError === "callback"}
      nextPath={nextPath}
    />
  );
}
