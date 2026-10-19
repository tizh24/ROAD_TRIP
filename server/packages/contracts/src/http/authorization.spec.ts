import {
  assertCapability,
  CapabilityForbiddenError,
  hasCapability,
  platformCapabilities,
  platformRoles,
  resolveCapabilities,
  type PlatformRole,
} from './authorization';

describe('Platform Authorization and Capability Resolver', () => {
  it('covers all platform roles with their expected capabilities', () => {
    for (const role of platformRoles) {
      const caps = resolveCapabilities(role);
      expect(caps.size).toBeGreaterThan(0);
      expect(caps.has('public.trip.read')).toBe(true);
      expect(caps.has('profile.read')).toBe(true);
      expect(caps.has('trip.create')).toBe(true);
      expect(caps.has('trip.clone')).toBe(true);
    }
  });

  it('restricts standard USER from partner, moderator, and admin capabilities', () => {
    const userRole: PlatformRole = 'USER';
    expect(hasCapability(userRole, 'profile.read')).toBe(true);
    expect(hasCapability(userRole, 'trip.create')).toBe(true);
    expect(hasCapability(userRole, 'partner.access')).toBe(false);
    expect(hasCapability(userRole, 'partner.listing.write')).toBe(false);
    expect(hasCapability(userRole, 'content.moderation.execute')).toBe(false);
    expect(hasCapability(userRole, 'admin.access')).toBe(false);
    expect(hasCapability(userRole, 'admin.role.grant')).toBe(false);

    expect(() => assertCapability(userRole, 'admin.access')).toThrow(
      CapabilityForbiddenError,
    );
  });

  it('grants PARTNER partner-specific capabilities but denies moderation and admin', () => {
    const partnerRole: PlatformRole = 'PARTNER';
    expect(hasCapability(partnerRole, 'partner.access')).toBe(true);
    expect(hasCapability(partnerRole, 'partner.listing.read')).toBe(true);
    expect(hasCapability(partnerRole, 'partner.listing.write')).toBe(true);
    expect(hasCapability(partnerRole, 'partner.analytics.read')).toBe(true);

    expect(hasCapability(partnerRole, 'content.moderation.execute')).toBe(
      false,
    );
    expect(hasCapability(partnerRole, 'admin.access')).toBe(false);
    expect(hasCapability(partnerRole, 'admin.role.grant')).toBe(false);

    expect(() =>
      assertCapability(partnerRole, 'content.moderation.execute'),
    ).toThrow(CapabilityForbiddenError);
  });

  it('grants MODERATOR content moderation but strictly denies admin and partner operations', () => {
    const moderatorRole: PlatformRole = 'MODERATOR';
    expect(hasCapability(moderatorRole, 'content.moderation.read')).toBe(true);
    expect(hasCapability(moderatorRole, 'content.moderation.execute')).toBe(
      true,
    );

    // Explicit invariant: Moderator cannot grant roles, manage finance, or access partner listings
    expect(hasCapability(moderatorRole, 'admin.access')).toBe(false);
    expect(hasCapability(moderatorRole, 'admin.role.grant')).toBe(false);
    expect(hasCapability(moderatorRole, 'admin.status.update')).toBe(false);
    expect(hasCapability(moderatorRole, 'admin.audit.read')).toBe(false);
    expect(hasCapability(moderatorRole, 'partner.listing.write')).toBe(false);

    expect(() => assertCapability(moderatorRole, 'admin.role.grant')).toThrow(
      CapabilityForbiddenError,
    );
  });

  it('grants ADMIN all platform management capabilities', () => {
    const adminRole: PlatformRole = 'ADMIN';
    for (const cap of platformCapabilities) {
      expect(hasCapability(adminRole, cap)).toBe(true);
      expect(() => assertCapability(adminRole, cap)).not.toThrow();
    }
  });

  it('restricts unauthenticated guest to public read only', () => {
    expect(hasCapability(undefined, 'public.trip.read')).toBe(true);
    expect(hasCapability(null, 'public.trip.read')).toBe(true);
    expect(hasCapability(undefined, 'profile.read')).toBe(false);
    expect(hasCapability(undefined, 'trip.create')).toBe(false);
    expect(hasCapability(undefined, 'admin.access')).toBe(false);

    expect(() => assertCapability(undefined, 'profile.read')).toThrow(
      CapabilityForbiddenError,
    );
  });
});
