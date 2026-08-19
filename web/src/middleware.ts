import type { NextRequest } from "next/server";
import { refreshSupabaseSession } from "@/lib/supabase/proxy";

// Next.js 16.3 on Windows can emit an empty middleware manifest for proxy.ts,
// skipping it at production runtime. Keep this supported legacy filename until
// the upstream Windows/Turbopack issue is fixed.
export async function middleware(request: NextRequest) {
  return refreshSupabaseSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
