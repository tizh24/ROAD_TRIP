const protectedPath = /^\/(?:dashboard|trips|trip-invitations|planner|road|memory|partner|admin|travel-book|payment)(?:\/|$)/;
const privateProfilePath = /^\/profile(?:$|\/(?:settings|collections|billing)(?:\/|$))/;

type CookieWithName = { name: string };

export function isProtectedRoute(pathname: string) {
  return protectedPath.test(pathname) || privateProfilePath.test(pathname);
}

export function hasGatewayAuthCookie(cookies: readonly CookieWithName[]) {
  const name = process.env.NEXT_PUBLIC_AUTH_ACCESS_COOKIE_NAME ?? "rt_access";
  return cookies.some((cookie) => cookie.name === name);
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
