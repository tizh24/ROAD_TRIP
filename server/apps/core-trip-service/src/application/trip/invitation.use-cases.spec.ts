import { InvitationUseCases } from './invitation.use-cases';
import { TripApplicationError } from './trip.use-cases';

const pending = {
  id: 'invite-1',
  tripId: 'trip-1',
  inviteeEmail: 'member@example.com',
  permission: 'VIEW' as const,
  status: 'PENDING' as const,
  expiresAt: '2099-01-01T00:00:00.000Z',
  acceptedUserId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('InvitationUseCases', () => {
  function subject() {
    const invitations = {
      create: jest.fn(),
      list: jest.fn(),
      listMembers: jest.fn(),
      findByToken: jest.fn(),
      respond: jest.fn(),
      revoke: jest.fn(),
      setPermission: jest.fn(),
      removeMember: jest.fn(),
      expire: jest.fn(),
    };
    const authorization = {
      assertCanManageMembers: jest.fn(),
      assertCanRead: jest.fn(),
    };
    return {
      invitations,
      authorization,
      useCases: new InvitationUseCases(
        invitations as never,
        authorization as never,
      ),
    };
  }
  it('normalizes an invitee email and requires owner authorization to invite', async () => {
    const { useCases, invitations, authorization } = subject();
    invitations.create.mockResolvedValue({ ...pending, token: 'raw-token' });
    await useCases.create(
      'owner-1',
      'trip-1',
      ' Member@Example.com ',
      'EDIT',
      'c-1',
    );
    expect(authorization.assertCanManageMembers).toHaveBeenCalledWith(
      'trip-1',
      'owner-1',
    );
    expect(invitations.create).toHaveBeenCalledWith(
      expect.objectContaining({
        inviteeEmail: 'member@example.com',
        permission: 'EDIT',
      }),
    );
  });
  it('does not disclose an invitation to a different email address', async () => {
    const { useCases, invitations } = subject();
    invitations.findByToken.mockResolvedValue(pending);
    await expect(
      useCases.view('member-1', 'other@example.com', 'raw-token'),
    ).rejects.toMatchObject({ code: 'INVITATION_INVALID' });
  });
  it('expires a pending invitation before rejecting it', async () => {
    const { useCases, invitations } = subject();
    invitations.findByToken.mockResolvedValue({
      ...pending,
      expiresAt: '2020-01-01T00:00:00.000Z',
    });
    await expect(
      useCases.view('member-1', 'member@example.com', 'raw-token'),
    ).rejects.toBeInstanceOf(TripApplicationError);
    expect(invitations.expire).toHaveBeenCalledWith('invite-1');
  });
  it('accepts only a valid invitation for the signed-in invitee', async () => {
    const { useCases, invitations } = subject();
    invitations.findByToken.mockResolvedValue(pending);
    invitations.respond.mockResolvedValue({
      ...pending,
      status: 'ACCEPTED',
      acceptedUserId: 'member-1',
    });
    await expect(
      useCases.respond(
        'member-1',
        'member@example.com',
        'raw-token',
        'ACCEPTED',
      ),
    ).resolves.toMatchObject({ status: 'ACCEPTED' });
    expect(invitations.respond).toHaveBeenCalledWith(
      'raw-token',
      'member@example.com',
      'member-1',
      'ACCEPTED',
    );
  });
  it('requires member-management authorization to revoke or change permissions', async () => {
    const { useCases, invitations, authorization } = subject();
    invitations.revoke.mockResolvedValue(true);
    invitations.setPermission.mockResolvedValue(true);
    invitations.removeMember.mockResolvedValue(true);
    await useCases.revoke('owner-1', 'trip-1', 'invite-1');
    await useCases.setMemberPermission('owner-1', 'trip-1', 'member-1', 'EDIT');
    await useCases.removeMember('owner-1', 'trip-1', 'member-1');
    expect(authorization.assertCanManageMembers).toHaveBeenCalledTimes(3);
  });
});
