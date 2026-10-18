import type {
  AccountStatus,
  PlatformCapability,
  PlatformRole,
} from '@roadtrip/contracts';

export type { AccountStatus, PlatformCapability, PlatformRole };

export interface AuthenticatedUserContext {
  userId: string;
  authRole: 'authenticated';
  platformRole?: PlatformRole;
  accountStatus?: AccountStatus;
  email?: string;
  sessionId?: string;
}

export interface PlatformProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  role: PlatformRole;
  status: AccountStatus;
}

export interface PlatformAuditRecord {
  id: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  correlationId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

export interface PlatformProfileStore {
  getRequired(userId: string): Promise<PlatformProfile>;
  updateSelf(
    userId: string,
    update: { fullName?: string; avatarUrl?: string | null },
  ): Promise<PlatformProfile>;
  updateRole(
    actorId: string,
    targetUserId: string,
    role: PlatformRole,
    correlationId?: string,
  ): Promise<PlatformProfile>;
  updateStatus(
    actorId: string,
    targetUserId: string,
    status: AccountStatus,
    correlationId?: string,
  ): Promise<PlatformProfile>;
  listAuditLogs(query?: {
    limit?: number;
    offset?: number;
  }): Promise<readonly PlatformAuditRecord[]>;
}

export const PLATFORM_PROFILE_STORE = Symbol('PLATFORM_PROFILE_STORE');

export interface AuthTokenVerifier {
  verify(token: string): Promise<AuthenticatedUserContext>;
}

export const AUTH_TOKEN_VERIFIER = Symbol('AUTH_TOKEN_VERIFIER');
export const GATEWAY_AUTH_CONFIG = Symbol('GATEWAY_AUTH_CONFIG');
