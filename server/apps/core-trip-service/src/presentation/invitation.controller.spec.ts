import { HttpException } from '@nestjs/common';
import { InvitationController, TripController } from './trip.controller';

const ownerId = '00000000-0000-4000-8000-000000000001';
const tripId = '00000000-0000-4000-8000-000000000002';
const invitation = {
  id: '00000000-0000-4000-8000-000000000003',
  tripId,
  inviteeEmail: 'member@example.com',
  permission: 'VIEW',
  status: 'PENDING',
  expiresAt: '2099-01-01T00:00:00.000Z',
  acceptedUserId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('Invitation HTTP controllers', () => {
  function subject() {
    const invitations = {
      create: jest.fn(),
      list: jest.fn(),
      listMembers: jest.fn(),
      revoke: jest.fn(),
      setMemberPermission: jest.fn(),
      removeMember: jest.fn(),
      view: jest.fn(),
      respond: jest.fn(),
    };
    return {
      invitations,
      trips: new TripController({} as never, invitations as never),
      landing: new InvitationController(invitations as never),
    };
  }
  it('creates a view/edit invitation as the owner and returns the stable envelope', async () => {
    const { invitations, trips } = subject();
    invitations.create.mockResolvedValue({
      ...invitation,
      permission: 'EDIT',
      token: 'secret-token',
    });
    const response = await trips.createInvitation(
      tripId,
      { email: 'member@example.com', permission: 'EDIT' },
      ownerId,
    );
    expect(response).toMatchObject({ data: { permission: 'EDIT' } });
    expect(typeof response.meta.correlationId).toBe('string');
    expect(invitations.create).toHaveBeenCalledWith(
      ownerId,
      tripId,
      'member@example.com',
      'EDIT',
      expect.any(String),
    );
  });
  it('rejects malformed invitation permissions before calling the use case', async () => {
    const { invitations, trips } = subject();
    await expect(
      trips.createInvitation(
        tripId,
        { email: 'member@example.com', permission: 'OWNER' },
        ownerId,
      ),
    ).rejects.toBeInstanceOf(HttpException);
    expect(invitations.create).not.toHaveBeenCalled();
  });
  it('uses the authenticated email to view and accept an invitation', async () => {
    const { invitations, landing } = subject();
    invitations.view.mockResolvedValue(invitation);
    invitations.respond.mockResolvedValue({
      ...invitation,
      status: 'ACCEPTED',
      acceptedUserId: ownerId,
    });
    await expect(
      landing.view('token', ownerId, 'member@example.com'),
    ).resolves.toMatchObject({ data: invitation });
    await expect(
      landing.accept('token', ownerId, 'member@example.com'),
    ).resolves.toMatchObject({ data: { status: 'ACCEPTED' } });
    expect(invitations.respond).toHaveBeenCalledWith(
      ownerId,
      'member@example.com',
      'token',
      'ACCEPTED',
    );
  });
  it('routes revoke and member management through the owner-bound trip endpoint', async () => {
    const { invitations, trips } = subject();
    invitations.revoke.mockResolvedValue(undefined);
    invitations.setMemberPermission.mockResolvedValue(undefined);
    invitations.removeMember.mockResolvedValue(undefined);
    await trips.revokeInvitation(tripId, invitation.id, ownerId);
    await trips.changeMemberPermission(
      tripId,
      ownerId,
      { permission: 'EDIT' },
      ownerId,
    );
    await trips.removeMember(tripId, ownerId, ownerId);
    expect(invitations.revoke).toHaveBeenCalledWith(
      ownerId,
      tripId,
      invitation.id,
    );
    expect(invitations.setMemberPermission).toHaveBeenCalledWith(
      ownerId,
      tripId,
      ownerId,
      'EDIT',
    );
    expect(invitations.removeMember).toHaveBeenCalledWith(
      ownerId,
      tripId,
      ownerId,
    );
  });
});
