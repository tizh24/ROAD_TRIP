import { BadRequestException } from '@nestjs/common';
import { AdminController } from './admin.controller';
import type { PlatformAuthorizationService } from './platform-authorization.service';
import type { AuthenticatedUserContext } from './auth.types';

describe('AdminController', () => {
  let controller: AdminController;
  let mockAuthService: Partial<PlatformAuthorizationService>;

  const adminUser: AuthenticatedUserContext = {
    userId: 'admin-1',
    authRole: 'authenticated',
    platformRole: 'ADMIN',
    accountStatus: 'ACTIVE',
  };

  beforeEach(() => {
    mockAuthService = {
      updateRole: jest.fn().mockResolvedValue({
        id: 'target-1',
        email: 'target@roadtrip.com',
        fullName: 'Target User',
        avatarUrl: null,
        role: 'MODERATOR',
        status: 'ACTIVE',
      }),
      updateStatus: jest.fn().mockResolvedValue({
        id: 'target-1',
        email: 'target@roadtrip.com',
        fullName: 'Target User',
        avatarUrl: null,
        role: 'USER',
        status: 'BANNED',
      }),
      listAuditLogs: jest.fn().mockResolvedValue([
        {
          id: 'log-1',
          actorId: 'admin-1',
          action: 'PLATFORM_ROLE_UPDATE',
          entityType: 'user_profile',
          entityId: 'target-1',
          oldValues: { role: 'USER' },
          newValues: { role: 'MODERATOR' },
          createdAt: new Date().toISOString(),
        },
      ]),
    };

    controller = new AdminController(
      mockAuthService as PlatformAuthorizationService,
    );
  });

  it('updates user role when valid role is provided', async () => {
    const res = await controller.updateRole(adminUser, 'target-1', {
      role: 'MODERATOR',
    });
    expect(res.data).toBeDefined();
    expect((res.data as { role: string }).role).toBe('MODERATOR');
    expect(mockAuthService.updateRole).toHaveBeenCalledWith(
      'admin-1',
      'target-1',
      'MODERATOR',
      undefined,
    );
  });

  it('throws BadRequestException when invalid role is provided', async () => {
    await expect(
      controller.updateRole(adminUser, 'target-1', { role: 'SUPERUSER' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('updates user status when valid status is provided', async () => {
    const res = await controller.updateStatus(adminUser, 'target-1', {
      status: 'BANNED',
    });
    expect(res.data).toBeDefined();
    expect((res.data as { status: string }).status).toBe('BANNED');
    expect(mockAuthService.updateStatus).toHaveBeenCalledWith(
      'admin-1',
      'target-1',
      'BANNED',
      undefined,
    );
  });

  it('throws BadRequestException when invalid status is provided', async () => {
    await expect(
      controller.updateStatus(adminUser, 'target-1', { status: 'UNKNOWN' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('lists platform audit logs', async () => {
    const res = await controller.listAuditLogs('10', '0');
    expect(res.data).toHaveLength(1);
    expect(mockAuthService.listAuditLogs).toHaveBeenCalledWith({
      limit: 10,
      offset: 0,
    });
  });
});
