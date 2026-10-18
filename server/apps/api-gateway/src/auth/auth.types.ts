export type PlatformRole = 'USER' | 'PARTNER' | 'ADMIN';
export type AccountStatus = 'ACTIVE' | 'BANNED' | 'DELETED';

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

export interface PlatformProfileStore {
  getRequired(userId: string): Promise<PlatformProfile>;
  updateSelf(
    userId: string,
    update: { fullName?: string; avatarUrl?: string | null },
  ): Promise<PlatformProfile>;
}

export const PLATFORM_PROFILE_STORE = Symbol('PLATFORM_PROFILE_STORE');

export interface AuthTokenVerifier {
  verify(token: string): Promise<AuthenticatedUserContext>;
}

export const AUTH_TOKEN_VERIFIER = Symbol('AUTH_TOKEN_VERIFIER');
export const GATEWAY_AUTH_CONFIG = Symbol('GATEWAY_AUTH_CONFIG');
