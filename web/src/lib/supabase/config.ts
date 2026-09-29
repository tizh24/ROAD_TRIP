const supabaseUrl =
  (typeof window === "undefined" ? process.env.SUPABASE_URL : undefined) ??
  process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// The web container reaches Supabase through host.docker.internal while browsers
// use a loopback URL. A fixed cookie name keeps their shared session intact.
export const supabaseCookieOptions = {
  name: "sb-roadtrip-auth-token",
} as const;

export function getSupabaseConfig() {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  return { supabaseUrl, supabasePublishableKey };
}
