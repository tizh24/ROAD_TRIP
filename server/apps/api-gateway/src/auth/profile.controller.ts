import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { getCorrelationId } from '@roadtrip/observability';
import type { AuthenticatedUserContext } from './auth.types';
import { CurrentUser } from './current-user.decorator';
import { CsrfGuard } from './csrf.guard';
import { PlatformAuthorizationService } from './platform-authorization.service';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { RateLimit } from '../security/rate-limit.types';

@Controller('api/v1/profile')
@UseGuards(SupabaseAuthGuard)
@RateLimit('authenticated')
export class ProfileController {
  constructor(private readonly authorization: PlatformAuthorizationService) {}

  @Get()
  async get(@CurrentUser() user: AuthenticatedUserContext) {
    return response(await this.authorization.currentProfile(user.userId));
  }

  @Patch()
  @UseGuards(CsrfGuard)
  async update(
    @CurrentUser() user: AuthenticatedUserContext,
    @Body() body: unknown,
  ) {
    return response(
      await this.authorization.updateSelf(user.userId, profileUpdate(body)),
    );
  }
}

function profileUpdate(body: unknown): {
  fullName?: string;
  avatarUrl?: string | null;
} {
  if (typeof body !== 'object' || body === null) invalidProfileUpdate();
  const value = body as Record<string, unknown>;
  const update: { fullName?: string; avatarUrl?: string | null } = {};
  if (value.fullName !== undefined) {
    if (
      typeof value.fullName !== 'string' ||
      !value.fullName.trim() ||
      value.fullName.length > 120
    ) {
      invalidProfileUpdate();
    }
    update.fullName = value.fullName.trim();
  }
  if (value.avatarUrl !== undefined) {
    if (
      value.avatarUrl !== null &&
      (typeof value.avatarUrl !== 'string' || !isHttpUrl(value.avatarUrl))
    ) {
      invalidProfileUpdate();
    }
    update.avatarUrl = value.avatarUrl;
  }
  if (!Object.keys(update).length) invalidProfileUpdate();
  return update;
}

function invalidProfileUpdate(): never {
  throw new BadRequestException({
    error: { code: 'VALIDATION_FAILED', message: 'Profile update is invalid.' },
    meta: { correlationId: getCorrelationId() ?? '' },
  });
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function response(data: unknown) {
  return { data, meta: { correlationId: getCorrelationId() ?? '' } };
}
