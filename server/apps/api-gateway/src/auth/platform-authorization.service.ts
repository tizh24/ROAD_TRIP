import { Inject, Injectable } from '@nestjs/common';
import type {
  AccountStatus,
  AuthenticatedUserContext,
  PlatformProfileStore,
  PlatformRole,
} from './auth.types';
import { PLATFORM_PROFILE_STORE } from './auth.types';
import {
  PlatformProfileNotFoundError,
  PlatformProfileUnavailableError,
} from './platform-profile.store';

export class InactiveAccountError extends Error {}

@Injectable()
export class PlatformAuthorizationService {
  constructor(
    @Inject(PLATFORM_PROFILE_STORE)
    private readonly profiles: PlatformProfileStore,
  ) {}

  async enrich(
    user: AuthenticatedUserContext,
  ): Promise<AuthenticatedUserContext> {
    const profile = await this.profiles.getRequired(user.userId);
    if (profile.status !== 'ACTIVE') throw new InactiveAccountError();
    return {
      ...user,
      ...(profile.email ? { email: profile.email } : {}),
      platformRole: profile.role,
      accountStatus: profile.status,
    };
  }

  async currentProfile(userId: string) {
    return this.profiles.getRequired(userId);
  }

  async updateSelf(
    userId: string,
    update: { fullName?: string; avatarUrl?: string | null },
  ) {
    return this.profiles.updateSelf(userId, update);
  }

  async updateRole(
    actorId: string,
    targetUserId: string,
    role: PlatformRole,
    correlationId?: string,
  ) {
    return this.profiles.updateRole(actorId, targetUserId, role, correlationId);
  }

  async updateStatus(
    actorId: string,
    targetUserId: string,
    status: AccountStatus,
    correlationId?: string,
  ) {
    return this.profiles.updateStatus(
      actorId,
      targetUserId,
      status,
      correlationId,
    );
  }

  async listAuditLogs(query?: { limit?: number; offset?: number }) {
    return this.profiles.listAuditLogs(query);
  }
}

export { PlatformProfileNotFoundError, PlatformProfileUnavailableError };
