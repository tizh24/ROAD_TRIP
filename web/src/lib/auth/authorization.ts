import "server-only";

import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const appRoles = ["USER", "PARTNER", "ADMIN"] as const;
export type AppRole = (typeof appRoles)[number];

function loginPath(nextPath: string) {
  return `/login?next=${encodeURIComponent(nextPath)}`;
}

export async function requireAuthenticatedUser(nextPath: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(loginPath(nextPath));
  }

  return user;
}

export async function requireRole(role: Exclude<AppRole, "USER">, nextPath: string) {
  const user = await requireAuthenticatedUser(nextPath);
  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile || profile.role !== role) {
    notFound();
  }

  return user;
}
