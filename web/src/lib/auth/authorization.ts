import "server-only";

import { forbidden, redirect } from "next/navigation";
import { gatewayCurrentSession } from "@/lib/api/gateway-server";
import {
  appRoles,
  hasCapability,
  platformCapabilities,
  type AppRole,
  type PlatformCapability,
} from "./capabilities";

export { appRoles, hasCapability, platformCapabilities };
export type { AppRole, PlatformCapability };

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

export async function requireCapability(
  capability: PlatformCapability,
  nextPath: string,
) {
  const user = await requireAuthenticatedUser(nextPath);
  if (!hasCapability(user.platformRole, capability)) {
    if (capability.startsWith("partner.")) {
      // Per spec: Users lacking partner capability visiting partner paths are redirected to /partner/register
      redirect("/partner/register");
    }
    // Per spec: Non-admin visiting /admin/** receives a real 403 page
    forbidden();
  }
  return user;
}

export async function requireRole(
  role: Exclude<AppRole, "USER">,
  nextPath: string,
) {
  if (role === "ADMIN") {
    return requireCapability("admin.access", nextPath);
  }
  if (role === "PARTNER") {
    return requireCapability("partner.access", nextPath);
  }
  if (role === "MODERATOR") {
    return requireCapability("content.moderation.read", nextPath);
  }
  return requireAuthenticatedUser(nextPath);
}
