import type { GatewayConfig } from '@roadtrip/config';
import {
  type AccountStatus,
  type PlatformProfile,
  type PlatformProfileStore,
  type PlatformRole,
} from './auth.types';

const roles = new Set<PlatformRole>(['USER', 'PARTNER', 'ADMIN']);
const statuses = new Set<AccountStatus>(['ACTIVE', 'BANNED', 'DELETED']);

/**
 * Transitional adapter for the profile table. The Gateway depends on this
 * interface rather than on Supabase row types so profile ownership can move to
 * the social context without changing authentication callers.
 */
export class SupabasePlatformProfileStore implements PlatformProfileStore {
  constructor(private readonly config: GatewayConfig) {}

  async getRequired(userId: string): Promise<PlatformProfile> {
    const url = new URL('/rest/v1/user_profiles', this.config.SUPABASE_URL);
    url.searchParams.set('id', `eq.${userId}`);
    url.searchParams.set('select', 'id,email,full_name,avatar_url,role,status');
    url.searchParams.set('limit', '1');
    const response = await fetch(url, {
      headers: serviceAuthorizationHeaders(this.config.SUPABASE_SERVICE_ROLE_KEY),
    });
    if (!response.ok) throw new PlatformProfileUnavailableError();
    const body: unknown = await response.json();
    if (!Array.isArray(body) || body.length !== 1) {
      throw new PlatformProfileNotFoundError();
    }
    const profile = body[0];
    if (!isProfile(profile)) throw new PlatformProfileUnavailableError();
    return toPlatformProfile(profile);
  }

  async updateSelf(
    userId: string,
    update: { fullName?: string; avatarUrl?: string | null },
  ): Promise<PlatformProfile> {
    const url = new URL('/rest/v1/user_profiles', this.config.SUPABASE_URL);
    url.searchParams.set('id', `eq.${userId}`);
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        ...serviceAuthorizationHeaders(this.config.SUPABASE_SERVICE_ROLE_KEY),
        'content-type': 'application/json',
        prefer: 'return=representation',
      },
      body: JSON.stringify({
        ...(update.fullName !== undefined
          ? { full_name: update.fullName }
          : {}),
        ...(update.avatarUrl !== undefined
          ? { avatar_url: update.avatarUrl }
          : {}),
      }),
    });
    if (!response.ok) throw new PlatformProfileUnavailableError();
    const body: unknown = await response.json();
    if (!Array.isArray(body) || body.length !== 1 || !isProfile(body[0])) {
      throw new PlatformProfileUnavailableError();
    }
    return toPlatformProfile(body[0]);
  }
}

function toPlatformProfile(profile: {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: PlatformRole;
  status: AccountStatus;
}): PlatformProfile {
  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    avatarUrl: profile.avatar_url,
    role: profile.role,
    status: profile.status,
  };
}

export class PlatformProfileNotFoundError extends Error {}
export class PlatformProfileUnavailableError extends Error {}

function serviceAuthorizationHeaders(serviceKey: string): Record<string, string> {
  // New `sb_secret_` keys authenticate via `apikey` and are not bearer JWTs.
  // Legacy service_role keys are JWTs and still require both headers for PostgREST.
  return serviceKey.startsWith('sb_secret_')
    ? { apikey: serviceKey }
    : { apikey: serviceKey, authorization: `Bearer ${serviceKey}` };
}

function isProfile(value: unknown): value is {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: PlatformRole;
  status: AccountStatus;
} {
  if (typeof value !== 'object' || value === null) return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === 'string' &&
    typeof row.email === 'string' &&
    typeof row.full_name === 'string' &&
    (typeof row.avatar_url === 'string' || row.avatar_url === null) &&
    typeof row.role === 'string' &&
    roles.has(row.role as PlatformRole) &&
    typeof row.status === 'string' &&
    statuses.has(row.status as AccountStatus)
  );
}
