import { NextResponse, type NextRequest } from "next/server";
import { getSafeInternalPath } from "@/lib/auth/route-protection";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const response = NextResponse.redirect(
        new URL(
          getSafeInternalPath(requestUrl.searchParams.get("next")) ??
            "/profile",
          requestUrl.origin,
        ),
      );
      response.cookies.set("rt_login_completed", "pkce", {
        path: "/", sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 120,
      });
      return response;
    }
  }

  return NextResponse.redirect(
    new URL("/login?authError=callback", requestUrl.origin),
  );
}
