import { createHash, randomBytes, randomUUID } from 'node:crypto';
import type { TransactionalDatabase } from './trip.repository';

export type InvitationPermission = 'VIEW' | 'EDIT';
export type InvitationStatus =
  'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED' | 'REVOKED';
export interface InvitationRow {
  id: string;
  tripId: string;
  inviteeEmail: string;
  permission: InvitationPermission;
  status: InvitationStatus;
  expiresAt: string;
  acceptedUserId: string | null;
  createdAt: string;
}
export interface MemberRow {
  userId: string;
  role: 'OWNER' | 'MEMBER';
  permission: InvitationPermission;
  status: 'ACTIVE' | 'LEFT' | 'REMOVED';
}

export class InvitationRepository {
  constructor(private readonly database: TransactionalDatabase) {}

  async create(input: {
    tripId: string;
    inviterId: string;
    inviteeEmail: string;
    permission: InvitationPermission;
    correlationId: string;
  }) {
    const token = randomBytes(32).toString('base64url');
    const tokenHash = hash(token);
    const id = randomUUID();
    const result = await this.database.transaction(async (transaction) => {
      const row = await transaction.query<InvitationRow>(
        `INSERT INTO trip_schema.trip_invitations (id, trip_id, inviter_id, invitee_email, permission, token_hash, expires_at)
        VALUES ($1,$2,$3,$4,$5,$6,now() + interval '7 days')
        RETURNING id, trip_id AS "tripId", invitee_email AS "inviteeEmail", permission, status, expires_at::text AS "expiresAt", accepted_user_id AS "acceptedUserId", created_at::text AS "createdAt"`,
        [
          id,
          input.tripId,
          input.inviterId,
          input.inviteeEmail,
          input.permission,
          tokenHash,
        ],
      );
      const invitation = row.rows[0]!;
      await transaction.query(
        `INSERT INTO trip_schema.outbox_events (id,aggregate_type,aggregate_id,event_type,event_version,payload,correlation_id,occurred_at)
        VALUES ($1,'trip-invitation',$2,'trip.invitation.created.v1',1,$3::jsonb,$4,now())`,
        [
          randomUUID(),
          id,
          JSON.stringify({
            invitationId: id,
            tripId: input.tripId,
            inviterId: input.inviterId,
            inviteeEmail: input.inviteeEmail,
            permission: input.permission,
            expiresAt: invitation.expiresAt,
          }),
          input.correlationId,
        ],
      );
      return invitation;
    });
    return { ...result, token };
  }

  async list(tripId: string): Promise<readonly InvitationRow[]> {
    return (
      await this.database.query<InvitationRow>(
        `SELECT id, trip_id AS "tripId", invitee_email AS "inviteeEmail", permission, status, expires_at::text AS "expiresAt", accepted_user_id AS "acceptedUserId", created_at::text AS "createdAt" FROM trip_schema.trip_invitations WHERE trip_id=$1 ORDER BY created_at DESC`,
        [tripId],
      )
    ).rows;
  }
  async listMembers(tripId: string): Promise<readonly MemberRow[]> {
    return (
      await this.database.query<MemberRow>(
        `SELECT user_id AS "userId", role, permission, status FROM trip_schema.trip_members WHERE trip_id=$1 ORDER BY role DESC, user_id`,
        [tripId],
      )
    ).rows;
  }
  async findByToken(token: string): Promise<InvitationRow | undefined> {
    return (
      await this.database.query<InvitationRow>(
        `SELECT id, trip_id AS "tripId", invitee_email AS "inviteeEmail", permission, status, expires_at::text AS "expiresAt", accepted_user_id AS "acceptedUserId", created_at::text AS "createdAt" FROM trip_schema.trip_invitations WHERE token_hash=$1`,
        [hash(token)],
      )
    ).rows[0];
  }
  async expire(id: string): Promise<void> {
    await this.database.query(
      `UPDATE trip_schema.trip_invitations SET status='EXPIRED' WHERE id=$1 AND status='PENDING' AND expires_at<=now()`,
      [id],
    );
  }
  async respond(
    token: string,
    email: string,
    userId: string,
    status: 'ACCEPTED' | 'DECLINED',
  ): Promise<InvitationRow | undefined> {
    return this.database.transaction(async (transaction) => {
      const result = await transaction.query<InvitationRow>(
        `UPDATE trip_schema.trip_invitations SET status=$4, accepted_user_id=CASE WHEN $4='ACCEPTED' THEN $3 ELSE NULL END, accepted_at=CASE WHEN $4='ACCEPTED' THEN now() ELSE NULL END WHERE token_hash=$1 AND invitee_email=$2 AND status='PENDING' AND expires_at>now() RETURNING id, trip_id AS "tripId", invitee_email AS "inviteeEmail", permission, status, expires_at::text AS "expiresAt", accepted_user_id AS "acceptedUserId", created_at::text AS "createdAt"`,
        [hash(token), email, userId, status],
      );
      const invitation = result.rows[0];
      if (invitation?.status === 'ACCEPTED')
        await transaction.query(
          `INSERT INTO trip_schema.trip_members (trip_id,user_id,role,permission,status) VALUES ($1,$2,'MEMBER',$3,'ACTIVE') ON CONFLICT (trip_id,user_id) DO UPDATE SET permission=EXCLUDED.permission,status='ACTIVE'`,
          [invitation.tripId, userId, invitation.permission],
        );
      return invitation;
    });
  }
  async revoke(tripId: string, id: string): Promise<boolean> {
    return (
      (
        await this.database.query(
          `UPDATE trip_schema.trip_invitations SET status='REVOKED' WHERE id=$1 AND trip_id=$2 AND status='PENDING'`,
          [id, tripId],
        )
      ).rowCount === 1
    );
  }
  async setPermission(
    tripId: string,
    userId: string,
    permission: InvitationPermission,
  ): Promise<boolean> {
    return (
      (
        await this.database.query(
          `UPDATE trip_schema.trip_members SET permission=$3 WHERE trip_id=$1 AND user_id=$2 AND role='MEMBER' AND status='ACTIVE'`,
          [tripId, userId, permission],
        )
      ).rowCount === 1
    );
  }
  async removeMember(tripId: string, userId: string): Promise<boolean> {
    return (
      (
        await this.database.query(
          `UPDATE trip_schema.trip_members SET status='REMOVED' WHERE trip_id=$1 AND user_id=$2 AND role='MEMBER' AND status='ACTIVE'`,
          [tripId, userId],
        )
      ).rowCount === 1
    );
  }
}
function hash(token: string) {
  return createHash('sha256').update(token).digest();
}
