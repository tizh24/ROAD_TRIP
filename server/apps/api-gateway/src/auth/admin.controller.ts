import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { getCorrelationId } from '@roadtrip/observability';
import {
  accountStatuses,
  platformRoles,
  type AccountStatus,
  type PlatformRole,
} from '@roadtrip/contracts';
import type { AuthenticatedUserContext } from './auth.types';
import { CapabilityGuard, RequireCapability } from './capability.guard';
import { CurrentUser } from './current-user.decorator';
import { CsrfGuard } from './csrf.guard';
import { PlatformAuthorizationService } from './platform-authorization.service';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { RateLimit } from '../security/rate-limit.types';

@Controller('api/v1/admin')
@UseGuards(SupabaseAuthGuard, CapabilityGuard)
@RateLimit('authenticated')
export class AdminController {
  constructor(private readonly authorization: PlatformAuthorizationService) {}

  @Patch('users/:userId/role')
  @UseGuards(CsrfGuard)
  @RequireCapability('admin.role.grant')
  async updateRole(
    @CurrentUser() user: AuthenticatedUserContext,
    @Param('userId') targetUserId: string,
    @Body() body: unknown,
  ) {
    const role = parseRole(body);
    const updated = await this.authorization.updateRole(
      user.userId,
      targetUserId,
      role,
      getCorrelationId() ?? undefined,
    );
    return response(updated);
  }

  @Patch('users/:userId/status')
  @UseGuards(CsrfGuard)
  @RequireCapability('admin.status.update')
  async updateStatus(
    @CurrentUser() user: AuthenticatedUserContext,
    @Param('userId') targetUserId: string,
    @Body() body: unknown,
  ) {
    const status = parseStatus(body);
    const updated = await this.authorization.updateStatus(
      user.userId,
      targetUserId,
      status,
      getCorrelationId() ?? undefined,
    );
    return response(updated);
  }

  @Get('audit-logs')
  @RequireCapability('admin.audit.read')
  async listAuditLogs(
    @Query('limit') limitStr?: string,
    @Query('offset') offsetStr?: string,
  ) {
    const limit = limitStr
      ? Math.min(Math.max(parseInt(limitStr, 10) || 50, 1), 100)
      : 50;
    const offset = offsetStr ? Math.max(parseInt(offsetStr, 10) || 0, 0) : 0;
    const logs = await this.authorization.listAuditLogs({ limit, offset });
    return response(logs);
  }
}

function parseRole(body: unknown): PlatformRole {
  if (typeof body !== 'object' || body === null)
    invalid('Role body is invalid.');
  const val = (body as Record<string, unknown>).role;
  if (typeof val !== 'string' || !platformRoles.includes(val as PlatformRole)) {
    invalid(
      'A valid platform role is required (USER, PARTNER, MODERATOR, ADMIN).',
    );
  }
  return val as PlatformRole;
}

function parseStatus(body: unknown): AccountStatus {
  if (typeof body !== 'object' || body === null)
    invalid('Status body is invalid.');
  const val = (body as Record<string, unknown>).status;
  if (
    typeof val !== 'string' ||
    !accountStatuses.includes(val as AccountStatus)
  ) {
    invalid('A valid account status is required (ACTIVE, BANNED, DELETED).');
  }
  return val as AccountStatus;
}

function invalid(message: string): never {
  throw new BadRequestException({
    error: { code: 'VALIDATION_FAILED', message },
    meta: { correlationId: getCorrelationId() ?? '' },
  });
}

function response(data: unknown) {
  return { data, meta: { correlationId: getCorrelationId() ?? '' } };
}
