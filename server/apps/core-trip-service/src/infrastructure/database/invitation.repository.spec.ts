import { InvitationRepository } from './invitation.repository';
import type { TransactionalDatabase } from './trip.repository';

class FakeDatabase {
  readonly queries: Array<{
    sql: string;
    values: readonly unknown[] | undefined;
  }> = [];
  rows: Record<string, unknown>[] = [];
  async transaction<Result>(
    work: (transaction: FakeDatabase) => Promise<Result>,
  ): Promise<Result> {
    return work(this);
  }
  query<Row>(sql: string, values?: readonly unknown[]) {
    this.queries.push({ sql, values });
    return Promise.resolve({ rows: this.rows as Row[], rowCount: 1 });
  }
}

describe('InvitationRepository', () => {
  const input = {
    tripId: '00000000-0000-4000-8000-000000000001',
    inviterId: '00000000-0000-4000-8000-000000000002',
    inviteeEmail: 'member@example.com',
    permission: 'VIEW' as const,
    correlationId: 'c-1',
  };
  it('persists only a hash and writes the invitation event in the same transaction', async () => {
    const database = new FakeDatabase();
    database.rows = [
      {
        id: '00000000-0000-4000-8000-000000000003',
        tripId: input.tripId,
        inviteeEmail: input.inviteeEmail,
        permission: 'VIEW',
        status: 'PENDING',
        expiresAt: '2099-01-01T00:00:00.000Z',
        acceptedUserId: null,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ];
    const result = await new InvitationRepository(
      database as unknown as TransactionalDatabase,
    ).create(input);
    expect(result.token).toEqual(expect.any(String));
    expect(database.queries.map((entry) => entry.sql)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('trip_schema.trip_invitations'),
        expect.stringContaining('trip_schema.outbox_events'),
      ]),
    );
    expect(database.queries[0]?.values).not.toContain(result.token);
    expect(
      database.queries[1]?.values?.some(
        (value) => typeof value === 'string' && value.includes(result.token),
      ),
    ).toBe(false);
  });
  it('accepts once and activates the matching member in one transaction', async () => {
    const database = new FakeDatabase();
    database.rows = [
      {
        id: '00000000-0000-4000-8000-000000000003',
        tripId: input.tripId,
        inviteeEmail: input.inviteeEmail,
        permission: 'EDIT',
        status: 'ACCEPTED',
        expiresAt: '2099-01-01T00:00:00.000Z',
        acceptedUserId: input.inviterId,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ];
    await new InvitationRepository(
      database as unknown as TransactionalDatabase,
    ).respond('token', input.inviteeEmail, input.inviterId, 'ACCEPTED');
    expect(database.queries.map((entry) => entry.sql)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('status=$4'),
        expect.stringContaining('trip_schema.trip_members'),
      ]),
    );
  });
  it('does not create a member row when an invitation is declined', async () => {
    const database = new FakeDatabase();
    database.rows = [
      {
        id: '00000000-0000-4000-8000-000000000003',
        tripId: input.tripId,
        inviteeEmail: input.inviteeEmail,
        permission: 'VIEW',
        status: 'DECLINED',
        expiresAt: '2099-01-01T00:00:00.000Z',
        acceptedUserId: null,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ];
    await new InvitationRepository(
      database as unknown as TransactionalDatabase,
    ).respond('token', input.inviteeEmail, input.inviterId, 'DECLINED');
    expect(database.queries).toHaveLength(1);
  });
});
