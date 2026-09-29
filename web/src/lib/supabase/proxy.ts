import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  buildLoginUrl,
  hasSupabaseAuthCookie,
  isProtectedRoute,
} from "@/lib/auth/route-protection";
import { getSupabaseConfig } from "./config";

export async function refreshSupabaseSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const hadAuthCookie = hasSupabaseAuthCookie(request.cookies.getAll());
  const { supabaseUrl, supabasePublishableKey } = getSupabaseConfig();
  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // This validates and refreshes an expired access token when possible.
  const { data } = await supabase.auth.getClaims();

  if (isProtectedRoute(request.nextUrl.pathname) && !data?.claims) {
    const redirectResponse = NextResponse.redirect(
      buildLoginUrl(request.nextUrl, hadAuthCookie),
    );

    // Preserve any cookie updates produced while Supabase attempted a refresh.
    response.cookies
      .getAll()
      .forEach((cookie) => redirectResponse.cookies.set(cookie));

    return redirectResponse;
  }

  return response;
}
