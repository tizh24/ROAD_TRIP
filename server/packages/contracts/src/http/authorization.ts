import { z } from 'zod';

export const platformRoles = ['USER', 'PARTNER', 'MODERATOR', 'ADMIN'] as const;
export type PlatformRole = (typeof platformRoles)[number];
export const platformRoleSchema = z.enum(platformRoles);

export const accountStatuses = ['ACTIVE', 'BANNED', 'DELETED'] as const;
export type AccountStatus = (typeof accountStatuses)[number];
export const accountStatusSchema = z.enum(accountStatuses);

export const partnerApplicationStatuses = [
  'NONE',
  'PENDING',
  'APPROVED',
  'REJECTED',
  'SUSPENDED',
] as const;
export type PartnerApplicationStatus =
  (typeof partnerApplicationStatuses)[number];
export const partnerApplicationStatusSchema = z.enum(
  partnerApplicationStatuses,
);

export const tripMemberRoles = ['OWNER', 'EDIT', 'VIEW'] as const;
export type TripMemberRole = (typeof tripMemberRoles)[number];
export const tripMemberRoleSchema = z.enum(tripMemberRoles);

export const platformCapabilities = [
  'public.trip.read',
  'profile.read',
  'profile.update_self',
  'trip.create',
  'trip.clone',
  'partner.access',
  'partner.listing.read',
  'partner.listing.write',
  'partner.analytics.read',
  'content.moderation.read',
  'content.moderation.execute',
  'admin.access',
  'admin.user.read',
  'admin.role.grant',
  'admin.status.update',
  'admin.partner.approve',
  'admin.audit.read',
] as const;
export type PlatformCapability = (typeof platformCapabilities)[number];
export const platformCapabilitySchema = z.enum(platformCapabilities);

const USER_CAPABILITIES: readonly PlatformCapability[] = [
  'public.trip.read',
  'profile.read',
  'profile.update_self',
  'trip.create',
  'trip.clone',
];

const PARTNER_CAPABILITIES: readonly PlatformCapability[] = [
  ...USER_CAPABILITIES,
  'partner.access',
  'partner.listing.read',
  'partner.listing.write',
  'partner.analytics.read',
];

const MODERATOR_CAPABILITIES: readonly PlatformCapability[] = [
  ...USER_CAPABILITIES,
  'content.moderation.read',
  'content.moderation.execute',
];

const ADMIN_CAPABILITIES: readonly PlatformCapability[] = [
  ...PARTNER_CAPABILITIES,
  ...MODERATOR_CAPABILITIES,
  'admin.access',
  'admin.user.read',
  'admin.role.grant',
  'admin.status.update',
  'admin.partner.approve',
  'admin.audit.read',
];

export const ROLE_CAPABILITIES: Record<
  PlatformRole,
  readonly PlatformCapability[]
> = {
  USER: USER_CAPABILITIES,
  PARTNER: PARTNER_CAPABILITIES,
  MODERATOR: MODERATOR_CAPABILITIES,
  ADMIN: ADMIN_CAPABILITIES,
};

const capabilitySetCache = new Map<
  PlatformRole,
  ReadonlySet<PlatformCapability>
>();
for (const role of platformRoles) {
  capabilitySetCache.set(role, new Set(ROLE_CAPABILITIES[role]));
}

export function resolveCapabilities(
  role: PlatformRole,
): ReadonlySet<PlatformCapability> {
  const set = capabilitySetCache.get(role);
  if (!set) {
    return new Set();
  }
  return set;
}

export function hasCapability(
  role: PlatformRole | undefined | null,
  capability: PlatformCapability,
): boolean {
  if (!role) return capability === 'public.trip.read';
  const set = capabilitySetCache.get(role);
  return Boolean(set?.has(capability));
}

export class CapabilityForbiddenError extends Error {
  constructor(readonly capability: PlatformCapability) {
    super(`Missing required capability: ${capability}`);
    this.name = 'CapabilityForbiddenError';
  }
}

export function assertCapability(
  role: PlatformRole | undefined | null,
  capability: PlatformCapability,
): void {
  if (!hasCapability(role, capability)) {
    throw new CapabilityForbiddenError(capability);
  }
}
