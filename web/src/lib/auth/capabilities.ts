export const appRoles = ["USER", "PARTNER", "MODERATOR", "ADMIN"] as const;
export type AppRole = (typeof appRoles)[number];

export const platformCapabilities = [
  "public.trip.read",
  "profile.read",
  "profile.update_self",
  "trip.create",
  "trip.clone",
  "partner.access",
  "partner.listing.read",
  "partner.listing.write",
  "partner.analytics.read",
  "content.moderation.read",
  "content.moderation.execute",
  "admin.access",
  "admin.user.read",
  "admin.role.grant",
  "admin.status.update",
  "admin.partner.approve",
  "admin.audit.read",
] as const;
export type PlatformCapability = (typeof platformCapabilities)[number];

export function hasCapability(
  role: AppRole | undefined | null,
  capability: PlatformCapability,
): boolean {
  if (!role) return capability === "public.trip.read";
  if (role === "ADMIN") return true;
  if (role === "MODERATOR") {
    return (
      capability === "public.trip.read" ||
      capability === "profile.read" ||
      capability === "profile.update_self" ||
      capability === "trip.create" ||
      capability === "trip.clone" ||
      capability === "content.moderation.read" ||
      capability === "content.moderation.execute"
    );
  }
  if (role === "PARTNER") {
    return (
      capability === "public.trip.read" ||
      capability === "profile.read" ||
      capability === "profile.update_self" ||
      capability === "trip.create" ||
      capability === "trip.clone" ||
      capability === "partner.access" ||
      capability === "partner.listing.read" ||
      capability === "partner.listing.write" ||
      capability === "partner.analytics.read"
    );
  }
  // USER
  return (
    capability === "public.trip.read" ||
    capability === "profile.read" ||
    capability === "profile.update_self" ||
    capability === "trip.create" ||
    capability === "trip.clone"
  );
}
