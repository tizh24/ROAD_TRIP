import { UnrecoverableError } from 'bullmq';
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
      transaction: (work: (tx: { query: typeof query }) => Promise<unknown>) =>
        work({ query }),
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
});
