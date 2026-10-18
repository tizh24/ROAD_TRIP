import "server-only";

import { notFound, redirect } from "next/navigation";
import { gatewayCurrentSession } from "@/lib/api/gateway-server";

export const appRoles = ["USER", "PARTNER", "ADMIN"] as const;
export type AppRole = (typeof appRoles)[number];

function loginPath(nextPath: string) {
  return `/login?next=${encodeURIComponent(nextPath)}`;
}

export async function requireAuthenticatedUser(nextPath: string) {
  const result = await gatewayCurrentSession();
  if (!result.data) {
    redirect(loginPath(nextPath));
  }
  return result.data;
}

export async function requireRole(role: Exclude<AppRole, "USER">, nextPath: string) {
  const user = await requireAuthenticatedUser(nextPath);
  if (user.platformRole !== role) {
    notFound();
  }

  return user;
}
