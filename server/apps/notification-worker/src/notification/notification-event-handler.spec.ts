import { UnrecoverableError } from 'bullmq';
import type { QueryExecutor } from '@roadtrip/db-client';
import { NotificationEventHandler } from './notification-event-handler';

describe('NotificationEventHandler', () => {
  const event = {
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
  it('records a processed event and pending delivery atomically', async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce({ rows: [{ eventId: event.eventId }] })
      .mockResolvedValue({ rows: [] });
    const database = {
      query,
      transaction: <Result>(
        work: (tx: QueryExecutor) => Promise<Result>,
      ): Promise<Result> => work({ query }),
    };
    await new NotificationEventHandler(database).handle(event);
    expect(query).toHaveBeenCalledTimes(2);
  });
  it('rejects malformed events without retry', async () => {
    const database = { query: jest.fn(), transaction: jest.fn() };
    await expect(
      new NotificationEventHandler(database).handle({}),
    ).rejects.toBeInstanceOf(UnrecoverableError);
  });

  it('ignores a replayed event after consumer recovery', async () => {
    const processed = new Set<string>();
    const deliveries: string[] = [];
    const query = jest.fn((sql: string, parameters?: unknown[]) => {
      if (sql.includes('processed_events')) {
        const eventId = parameters?.[0] as string;
        if (processed.has(eventId)) return Promise.resolve({ rows: [] });
        processed.add(eventId);
        return Promise.resolve({ rows: [{ eventId }] });
      }
      if (sql.includes('notification_deliveries')) {
        deliveries.push(parameters?.[0] as string);
      }
      return Promise.resolve({ rows: [] });
    });
    const database = {
      query,
      transaction: <Result>(
        work: (tx: QueryExecutor) => Promise<Result>,
      ): Promise<Result> => work({ query } as never),
    };
    const handler = new NotificationEventHandler(database as never);

    await handler.handle(event);
    await handler.handle(event);

    expect(deliveries).toEqual([event.eventId]);
    expect(query).toHaveBeenCalledTimes(3);
  });

  it('skips delivery if invitation was revoked before processing', async () => {
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

    const query = jest.fn((sql: string) => {
      if (sql.includes('processed_events')) {
        return Promise.resolve({ rows: [{ eventId: invitationEvent.eventId }] });
      }
      if (sql.includes('trip_invitations')) {
        return Promise.resolve({ rows: [{ status: 'REVOKED' }] });
      }
      if (sql.includes('notification_deliveries')) {
        return Promise.resolve({ rows: [] });
      }
      return Promise.resolve({ rows: [] });
    });

    const database = {
      query,
      transaction: <Result>(work: (tx: QueryExecutor) => Promise<Result>): Promise<Result> =>
        work({ query } as never),
    };

    const sender = { send: jest.fn() };
    const handler = new NotificationEventHandler(database as never, sender);

    await handler.handle(invitationEvent);

    expect(sender.send).not.toHaveBeenCalled();
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('SKIPPED'),
      expect.arrayContaining([invitationEvent.eventId, 'invited@example.com']),
    );
  });

  it('marks delivery as FAILED with retry interval when sender fails', async () => {
    const query = jest.fn((sql: string) => {
      if (sql.includes('processed_events')) {
        return Promise.resolve({ rows: [{ eventId: event.eventId }] });
      }
      return Promise.resolve({ rows: [] });
    });

    const database = {
      query,
      transaction: <Result>(work: (tx: QueryExecutor) => Promise<Result>): Promise<Result> =>
        work({ query } as never),
    };

    const failingSender = {
      send: jest.fn().mockRejectedValue(new Error('SMTP timeout')),
    };
    const handler = new NotificationEventHandler(database as never, failingSender);

    await handler.handle(event);

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('FAILED'),
      expect.arrayContaining([event.eventId, 'SMTP timeout']),
    );
  });
});
