import { NextResponse, type NextRequest } from "next/server";

// OAuth/PKCE sign-in is not offered. The browser never talks to Supabase Auth;
// sessions are only created by the Gateway, so any callback is a failed link.
export function GET(request: NextRequest) {
  return NextResponse.redirect(
    new URL("/login?authError=callback", request.nextUrl.origin),
  );
}
