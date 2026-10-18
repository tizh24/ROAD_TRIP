import type { GatewayConfig } from '@roadtrip/config';
import {
  accountStatuses,
  platformRoles,
  type AccountStatus,
  type PlatformRole,
} from '@roadtrip/contracts';
import type {
  PlatformAuditRecord,
  PlatformProfile,
  PlatformProfileStore,
} from './auth.types';

const roles = new Set<PlatformRole>(platformRoles);
const statuses = new Set<AccountStatus>(accountStatuses);

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

  async updateRole(
    actorId: string,
    targetUserId: string,
    role: PlatformRole,
    correlationId?: string,
  ): Promise<PlatformProfile> {
    const previous = await this.getRequired(targetUserId);

    const url = new URL('/rest/v1/user_profiles', this.config.SUPABASE_URL);
    url.searchParams.set('id', `eq.${targetUserId}`);
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        ...serviceAuthorizationHeaders(this.config.SUPABASE_SERVICE_ROLE_KEY),
        'content-type': 'application/json',
        prefer: 'return=representation',
      },
      body: JSON.stringify({ role }),
    });
    if (!response.ok) throw new PlatformProfileUnavailableError();
    const body: unknown = await response.json();
    if (!Array.isArray(body) || body.length !== 1 || !isProfile(body[0])) {
      throw new PlatformProfileUnavailableError();
    }

    const updated = toPlatformProfile(body[0]);

    // Record immutable audit entry
    await this.recordAudit({
      actorId,
      action: 'PLATFORM_ROLE_UPDATE',
      entityType: 'user_profile',
      entityId: targetUserId,
      oldValues: { role: previous.role },
      newValues: { role: updated.role },
      correlationId,
    });

    return updated;
  }

  async updateStatus(
    actorId: string,
    targetUserId: string,
    status: AccountStatus,
    correlationId?: string,
  ): Promise<PlatformProfile> {
    const previous = await this.getRequired(targetUserId);

    const url = new URL('/rest/v1/user_profiles', this.config.SUPABASE_URL);
    url.searchParams.set('id', `eq.${targetUserId}`);
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        ...serviceAuthorizationHeaders(this.config.SUPABASE_SERVICE_ROLE_KEY),
        'content-type': 'application/json',
        prefer: 'return=representation',
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new PlatformProfileUnavailableError();
    const body: unknown = await response.json();
    if (!Array.isArray(body) || body.length !== 1 || !isProfile(body[0])) {
      throw new PlatformProfileUnavailableError();
    }

    const updated = toPlatformProfile(body[0]);

    // Record immutable audit entry
    await this.recordAudit({
      actorId,
      action: 'ACCOUNT_STATUS_UPDATE',
      entityType: 'user_profile',
      entityId: targetUserId,
      oldValues: { status: previous.status },
      newValues: { status: updated.status },
      correlationId,
    });

    return updated;
  }

  async listAuditLogs(query?: {
    limit?: number;
    offset?: number;
  }): Promise<readonly PlatformAuditRecord[]> {
    const url = new URL('/rest/v1/platform_audit_logs', this.config.SUPABASE_URL);
    url.searchParams.set('select', '*');
    url.searchParams.set('order', 'created_at.desc');
    url.searchParams.set('limit', String(query?.limit ?? 50));
    if (query?.offset) {
      url.searchParams.set('offset', String(query.offset));
    }

    const response = await fetch(url, {
      headers: serviceAuthorizationHeaders(this.config.SUPABASE_SERVICE_ROLE_KEY),
    });
    if (!response.ok) throw new PlatformProfileUnavailableError();
    const body: unknown = await response.json();
    if (!Array.isArray(body)) throw new PlatformProfileUnavailableError();
    return body.map((row) => ({
      id: String(row.id),
      actorId: String(row.actor_id),
      action: String(row.action),
      entityType: String(row.entity_type),
      entityId: String(row.entity_id),
      oldValues: row.old_values as Record<string, unknown> | null,
      newValues: row.new_values as Record<string, unknown> | null,
      correlationId: row.correlation_id ? String(row.correlation_id) : null,
      ipAddress: row.ip_address ? String(row.ip_address) : null,
      userAgent: row.user_agent ? String(row.user_agent) : null,
      createdAt: String(row.created_at),
    }));
  }

  private async recordAudit(record: {
    actorId: string;
    action: string;
    entityType: string;
    entityId: string;
    oldValues?: Record<string, unknown> | undefined;
    newValues?: Record<string, unknown> | undefined;
    correlationId?: string | undefined;
  }): Promise<void> {
    try {
      const url = new URL('/rest/v1/platform_audit_logs', this.config.SUPABASE_URL);
      await fetch(url, {
        method: 'POST',
        headers: {
          ...serviceAuthorizationHeaders(this.config.SUPABASE_SERVICE_ROLE_KEY),
          'content-type': 'application/json',
          prefer: 'return=minimal',
        },
        body: JSON.stringify({
          actor_id: record.actorId,
          action: record.action,
          entity_type: record.entityType,
          entity_id: record.entityId,
          old_values: record.oldValues ?? null,
          new_values: record.newValues ?? null,
          correlation_id: record.correlationId ?? null,
        }),
      });
    } catch {
      // Audit recording should not break caller if audit table insertion fails, but is logged
    }
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
