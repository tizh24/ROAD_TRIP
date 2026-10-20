import { NextResponse, type NextRequest } from "next/server";
import {
  buildLoginUrl,
  hasGatewayAuthCookie,
  isProtectedRoute,
} from "@/lib/auth/route-protection";

export function proxy(request: NextRequest) {
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
