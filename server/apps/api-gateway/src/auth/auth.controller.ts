import { Controller, Get, UseGuards } from '@nestjs/common';
import { getCorrelationId } from '@roadtrip/observability';
import { randomUUID } from 'node:crypto';
import { CurrentUser } from './current-user.decorator';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import type { AuthenticatedUserContext } from './auth.types';
import { RateLimit } from '../security/rate-limit.types';

@Controller('api/v1')
export class AuthController {
  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  @RateLimit('authenticated')
  me(@CurrentUser() user: AuthenticatedUserContext) {
    return {
      data: {
        id: user.userId,
        role: user.role,
        ...(user.email ? { email: user.email } : {}),
      },
      meta: { correlationId: getCorrelationId() ?? randomUUID() },
    };
  }
}
