import { TripAuthorizationPolicy } from '../authorization/trip-authorization.policy';
import {
  InvitationRepository,
  type InvitationPermission,
} from '../../infrastructure/database/invitation.repository';
import { TripApplicationError } from './trip.use-cases';

export class InvitationUseCases {
  constructor(
    private readonly invitations: InvitationRepository,
    private readonly authorization: TripAuthorizationPolicy,
  ) {}
  async create(
    actorId: string,
    tripId: string,
    email: string,
    permission: InvitationPermission,
    correlationId: string,
  ) {
    await this.authorization.assertCanManageMembers(tripId, actorId);
    const inviteeEmail = normalizeEmail(email);
    return this.invitations.create({
      tripId,
      inviterId: actorId,
      inviteeEmail,
      permission,
      correlationId,
    });
  }
  async list(actorId: string, tripId: string) {
    await this.authorization.assertCanManageMembers(tripId, actorId);
    return this.invitations.list(tripId);
  }
  async listMembers(actorId: string, tripId: string) {
    await this.authorization.assertCanRead(tripId, actorId);
    return this.invitations.listMembers(tripId);
  }
  async view(actorId: string, email: string, token: string) {
    const invitation = await this.invitations.findByToken(token);
    if (!invitation || normalizeEmail(email) !== invitation.inviteeEmail)
      throw invalid();
    if (
      new Date(invitation.expiresAt) <= new Date() &&
      invitation.status === 'PENDING'
    ) {
      await this.invitations.expire(invitation.id);
      throw new TripApplicationError(
        'INVITATION_EXPIRED',
        'Invitation has expired.',
      );
    }
    return invitation;
  }
  async respond(
    actorId: string,
    email: string,
    token: string,
    status: 'ACCEPTED' | 'DECLINED',
  ) {
    await this.view(actorId, email, token);
    const invitation = await this.invitations.respond(
      token,
      normalizeEmail(email),
      actorId,
      status,
    );
    if (!invitation) throw invalid();
    return invitation;
  }
  async revoke(actorId: string, tripId: string, invitationId: string) {
    await this.authorization.assertCanManageMembers(tripId, actorId);
    if (!(await this.invitations.revoke(tripId, invitationId))) throw invalid();
  }
  async setMemberPermission(
    actorId: string,
    tripId: string,
    userId: string,
    permission: InvitationPermission,
  ) {
    await this.authorization.assertCanManageMembers(tripId, actorId);
    if (!(await this.invitations.setPermission(tripId, userId, permission)))
      throw invalid();
  }
  async removeMember(actorId: string, tripId: string, userId: string) {
    await this.authorization.assertCanManageMembers(tripId, actorId);
    if (!(await this.invitations.removeMember(tripId, userId))) throw invalid();
  }
}
function normalizeEmail(email: string) {
  const value = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
    throw new TripApplicationError(
      'VALIDATION_FAILED',
      'A valid invitee email is required.',
    );
  return value;
}
function invalid() {
  return new TripApplicationError(
    'INVITATION_INVALID',
    'Invitation is invalid or no longer available.',
  );
}
