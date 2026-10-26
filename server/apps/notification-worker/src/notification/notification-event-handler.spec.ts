import { UnrecoverableError } from 'bullmq';
import type { QueryExecutor } from '@roadtrip/db-client';
import { NotificationEventHandler } from './notification-event-handler';

const tripEvent = {
  eventId: '00000000-0000-4000-8000-000000000001',
  eventType: 'trip.created.v1',
  eventVersion: 1,
  occurredAt: '2026-08-29T00:00:00.000Z',
  correlationId: 'c-1',
  producer: 'core-trip-service',
  aggregateId: '00000000-0000-4000-8000-000000000002',
  payload: {
    tripId: '00000000-0000-4000-8000-000000000002',
    ownerId: '00000000-0000-4000-8000-000000000003',
    title: 'Trip',
    startDate: '2026-09-01',
    endDate: '2026-09-02',
    dayCount: 2,
  },
};

const invitationEvent = {
  eventId: '00000000-0000-4000-8000-000000000010',
  eventType: 'trip.invitation.created.v1',
  eventVersion: 1,
  occurredAt: '2026-08-29T00:00:00.000Z',
  correlationId: 'c-10',
  producer: 'core-trip-service',
  aggregateId: '00000000-0000-4000-8000-000000000011',
  payload: {
    invitationId: '00000000-0000-4000-8000-000000000011',
    tripId: '00000000-0000-4000-8000-000000000002',
    inviterId: '00000000-0000-4000-8000-000000000003',
    inviteeEmail: 'invited@example.com',
    permission: 'VIEW',
    expiresAt: '2026-09-05T00:00:00.000Z',
  },
};

interface Delivery {
  status: string;
  attempts: number;
  lastError?: string;
}

/** In-memory model of the delivery table behind the handler's SQL. */
function fakeDatabase(invitationStatus = 'PENDING') {
  const deliveries = new Map<string, Delivery>();
  const key = (params?: unknown[]) =>
    `${String(params?.[0])}|${String(params?.[1])}|${String(params?.[2])}`;
  const query = jest.fn((sql: string, params?: unknown[]) => {
    if (
      sql.includes('INSERT INTO notification_schema.notification_deliveries')
    ) {
      if (!deliveries.has(key(params)))
        deliveries.set(key(params), { status: 'PENDING', attempts: 0 });
      return Promise.resolve({ rows: [] });
    }
    if (sql.includes('FOR UPDATE')) {
      const row = deliveries.get(key(params));
      return Promise.resolve({
        rows: row ? [{ deliveryStatus: row.status }] : [],
      });
    }
    if (sql.includes('trip_schema.trip_invitations')) {
      return Promise.resolve({ rows: [{ status: invitationStatus }] });
    }
    if (sql.includes('UPDATE notification_schema.notification_deliveries')) {
      const row = deliveries.get(key(params))!;
      row.status = sql.includes("'SENT'")
        ? 'SENT'
        : sql.includes("'FAILED'")
          ? 'FAILED'
          : 'SKIPPED';
      if (row.status !== 'SKIPPED') row.attempts += 1;
      if (row.status === 'FAILED') row.lastError = String(params?.[4]);
      return Promise.resolve({ rows: [] });
    }
    return Promise.resolve({ rows: [] });
  });
  const database = {
    query,
    transaction: <Result>(
      work: (tx: QueryExecutor) => Promise<Result>,
    ): Promise<Result> => work({ query } as never),
  };
  return { database: database as never, deliveries };
}

describe('NotificationEventHandler', () => {
  it('rejects malformed events without retry', async () => {
    const { database } = fakeDatabase();
    await expect(
      new NotificationEventHandler(database).handle({}),
    ).rejects.toBeInstanceOf(UnrecoverableError);
  });

  it('delivers once and ignores a replayed event', async () => {
    const { database, deliveries } = fakeDatabase();
    const sender = { send: jest.fn().mockResolvedValue(undefined) };
    const handler = new NotificationEventHandler(database, sender);

    await handler.handle(tripEvent);
    await handler.handle(tripEvent);

    expect(sender.send).toHaveBeenCalledTimes(1);
    expect([...deliveries.values()]).toEqual([{ status: 'SENT', attempts: 1 }]);
  });

  it('skips delivery if the invitation was revoked before processing', async () => {
    const { database, deliveries } = fakeDatabase('REVOKED');
    const sender = { send: jest.fn() };
    await new NotificationEventHandler(database, sender).handle(
      invitationEvent,
    );

    expect(sender.send).not.toHaveBeenCalled();
    expect([...deliveries.values()][0]?.status).toBe('SKIPPED');
  });

  it('records a failed delivery and rethrows so BullMQ retries it', async () => {
    const { database, deliveries } = fakeDatabase();
    const sender = {
      send: jest
        .fn()
        .mockRejectedValueOnce(new Error('SMTP timeout'))
        .mockResolvedValueOnce(undefined),
    };
    const handler = new NotificationEventHandler(database, sender);

    await expect(handler.handle(tripEvent)).rejects.toThrow('SMTP timeout');
    expect([...deliveries.values()][0]).toMatchObject({
      status: 'FAILED',
      attempts: 1,
      lastError: 'SMTP timeout',
    });

    await handler.handle(tripEvent);
    expect(sender.send).toHaveBeenCalledTimes(2);
    expect([...deliveries.values()][0]).toMatchObject({
      status: 'SENT',
      attempts: 2,
    });
  });
});
