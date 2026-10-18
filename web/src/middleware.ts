import { NextResponse, type NextRequest } from "next/server";
import {
  buildLoginUrl,
  hasGatewayAuthCookie,
  isProtectedRoute,
} from "@/lib/auth/route-protection";

// Next.js 16.3 on Windows can emit an empty middleware manifest for proxy.ts,
// skipping it at production runtime. Keep this supported legacy filename until
// the upstream Windows/Turbopack issue is fixed.
export function middleware(request: NextRequest) {
  if (
    isProtectedRoute(request.nextUrl.pathname) &&
    !hasGatewayAuthCookie(request.cookies.getAll())
  ) {
    return NextResponse.redirect(buildLoginUrl(request.nextUrl, false));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!health(?:/|$)|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
