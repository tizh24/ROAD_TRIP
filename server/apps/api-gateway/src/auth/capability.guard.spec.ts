import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CapabilityGuard, REQUIRE_CAPABILITY_KEY } from './capability.guard';
import type { AuthenticatedRequest } from './supabase-auth.guard';

describe('CapabilityGuard', () => {
  let reflector: Reflector;
  let guard: CapabilityGuard;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new CapabilityGuard(reflector);
  });

  function createMockContext(
    role?: 'USER' | 'PARTNER' | 'MODERATOR' | 'ADMIN',
  ): ExecutionContext {
    const request: Partial<AuthenticatedRequest> = {
      headers: { 'x-correlation-id': 'corr-123' },
      ...(role
        ? {
            auth: {
              userId: 'user-1',
              authRole: 'authenticated',
              platformRole: role,
              accountStatus: 'ACTIVE',
            },
          }
        : {}),
    };

    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => request as AuthenticatedRequest,
      }),
    } as unknown as ExecutionContext;
  }

  it('allows access if no capability is required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = createMockContext('USER');
    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows user with required capability', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue('admin.access');
    const adminContext = createMockContext('ADMIN');
    expect(guard.canActivate(adminContext)).toBe(true);
  });

  it('throws ForbiddenException (403) when user lacks capability', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue('admin.access');
    const userContext = createMockContext('USER');
    expect(() => guard.canActivate(userContext)).toThrow(ForbiddenException);
  });

  it('denies moderator from admin operations', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue('admin.role.grant');
    const modContext = createMockContext('MODERATOR');
    expect(() => guard.canActivate(modContext)).toThrow(ForbiddenException);
  });

  it('allows moderator for content moderation', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue('content.moderation.execute');
    const modContext = createMockContext('MODERATOR');
    expect(guard.canActivate(modContext)).toBe(true);
  });
});
