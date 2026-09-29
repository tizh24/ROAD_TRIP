import type { EventPublisher } from '../../application/events/event-publisher.port';
import { OutboxPublisher } from './outbox-publisher';
import { OutboxMetrics } from '../observability/outbox-metrics';

describe('OutboxPublisher', () => {
  const event = {
    id: '00000000-0000-4000-8000-000000000001',
    aggregateId: '00000000-0000-4000-8000-000000000002',
    eventType: 'trip.created.v1',
    eventVersion: 1,
    payload: { title: 'Trip' },
    correlationId: 'correlation-1',
    occurredAt: '2026-08-29T00:00:00.000Z',
  };

  it('claims, publishes, and marks an outbox event as published', async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce({ rows: [event] })
      .mockResolvedValue({ rows: [] });
    const database = {
      transaction: async (
        work: (tx: { query: typeof query }) => Promise<unknown>,
      ) => work({ query }),
      query,
    };
    const publish = jest.fn().mockResolvedValue(undefined);
    const publisher: jest.Mocked<EventPublisher> = { publish };
    const outbox = new OutboxPublisher(
      database as never,
      publisher,
      new OutboxMetrics(),
    );

    await expect(outbox.publishPending()).resolves.toBe(1);
    expect(publish).toHaveBeenCalledWith(
      expect.objectContaining({
        eventId: event.id,
        eventType: event.eventType,
      }),
    );
    expect(query).toHaveBeenCalledTimes(2);
  });

  it('records a retryable failure without dropping the event', async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce({ rows: [event] })
      .mockResolvedValue({ rows: [] });
    const database = {
      transaction: async (
        work: (tx: { query: typeof query }) => Promise<unknown>,
      ) => work({ query }),
      query,
    };
    const publisher: EventPublisher = {
      publish: jest.fn().mockRejectedValue(new Error('Redis unavailable')),
    };
    const outbox = new OutboxPublisher(
      database as never,
      publisher,
      new OutboxMetrics(),
    );

    await expect(outbox.publishPending()).resolves.toBe(1);
    const failedUpdateCall: unknown = query.mock.calls[1];
    expect(failedUpdateCall).toEqual(
      expect.arrayContaining([
        expect.stringContaining("publish_status = 'FAILED'"),
      ]),
    );
  });

  it('continues a claimed backlog after one event fails and leaves it retryable', async () => {
    const secondEvent = {
      ...event,
      id: '00000000-0000-4000-8000-000000000003',
    };
    const query = jest
      .fn()
      .mockResolvedValueOnce({ rows: [event, secondEvent] })
      .mockResolvedValue({ rows: [] });
    const database = {
      transaction: async (
        work: (tx: { query: typeof query }) => Promise<unknown>,
      ) => work({ query }),
      query,
    };
    const publish = jest
      .fn()
      .mockRejectedValueOnce(new Error('Redis restart'))
      .mockResolvedValueOnce(undefined);
    const metrics = new OutboxMetrics();
    const outbox = new OutboxPublisher(database as never, { publish }, metrics);

    await expect(outbox.publishPending(2)).resolves.toBe(2);

    expect(publish).toHaveBeenCalledTimes(2);
    const failedUpdateCall: unknown = query.mock.calls[1];
    const publishedUpdateCall: unknown = query.mock.calls[2];
    expect(failedUpdateCall).toEqual(
      expect.arrayContaining([
        expect.stringContaining("publish_status = 'FAILED'"),
      ]),
    );
    expect(publishedUpdateCall).toEqual(
      expect.arrayContaining([
        expect.stringContaining("publish_status = 'PUBLISHED'"),
      ]),
    );
    expect(metrics.renderPrometheus()).toContain(
      'roadtrip_outbox_events_published_total 1',
    );
    expect(metrics.renderPrometheus()).toContain(
      'roadtrip_outbox_events_failed_total 1',
    );
  });
});
