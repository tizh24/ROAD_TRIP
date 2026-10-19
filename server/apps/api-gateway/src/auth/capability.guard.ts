import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { hasCapability, type PlatformCapability } from '@roadtrip/contracts';
import { authError } from './auth.errors';
import type { AuthenticatedRequest } from './supabase-auth.guard';

export const REQUIRE_CAPABILITY_KEY = 'REQUIRE_CAPABILITY';

export const RequireCapability = (capability: PlatformCapability) =>
  SetMetadata(REQUIRE_CAPABILITY_KEY, capability);

@Injectable()
export class CapabilityGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredCapability = this.reflector.getAllAndOverride<
      PlatformCapability | undefined
    >(REQUIRE_CAPABILITY_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredCapability) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const platformRole = request.auth?.platformRole;

    if (!hasCapability(platformRole, requiredCapability)) {
      throw authError('FORBIDDEN', request.headers);
    }

    return true;
  }
}
