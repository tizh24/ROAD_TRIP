import { NextResponse, type NextRequest } from "next/server";
import { getSafeInternalPath } from "@/lib/auth/route-protection";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session) {
      const response = NextResponse.redirect(
        new URL(
          getSafeInternalPath(requestUrl.searchParams.get("next")) ??
            "/dashboard",
          requestUrl.origin,
        ),
      );
      const gatewayResponse = await fetch(
        new URL(
          "/api/v1/auth/session/import",
          process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4100",
        ),
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
            expiresIn: data.session.expires_in,
          }),
          cache: "no-store",
        },
      );
      if (!gatewayResponse.ok) {
        return NextResponse.redirect(
          new URL("/login?authError=callback", requestUrl.origin),
        );
      }
      copyGatewayCookies(gatewayResponse.headers, response);
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

function copyGatewayCookies(source: Headers, target: NextResponse) {
  const withGetSetCookie = source as Headers & { getSetCookie?: () => string[] };
  const values = withGetSetCookie.getSetCookie?.() ?? [];
  if (values.length > 0) {
    values.forEach((value) => target.headers.append("set-cookie", value));
    return;
  }
  const value = source.get("set-cookie");
  if (value) target.headers.append("set-cookie", value);
}
