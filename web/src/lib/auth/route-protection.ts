const protectedTripsPath = /^\/trips(?:\/|$)/;

type CookieWithName = { name: string };

export function isProtectedRoute(pathname: string) {
  return protectedTripsPath.test(pathname);
}

export function hasSupabaseAuthCookie(cookies: readonly CookieWithName[]) {
  return cookies.some(
    ({ name }) => name.startsWith("sb-") && name.includes("-auth-token"),
  );
}

export function getSafeInternalPath(value: unknown) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /[\r\n]/.test(value)
  ) {
    return null;
  }

  return value;
}

export function buildLoginUrl(requestUrl: URL, sessionExpired: boolean) {
  const loginUrl = new URL("/login", requestUrl.origin);
  loginUrl.searchParams.set(
    "next",
    `${requestUrl.pathname}${requestUrl.search}`,
  );

  if (sessionExpired) {
    loginUrl.searchParams.set("authError", "session_expired");
  }

  return loginUrl;
}
