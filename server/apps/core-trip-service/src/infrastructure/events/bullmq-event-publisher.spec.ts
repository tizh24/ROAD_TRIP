import {
  BullMqEventPublisher,
  type QueueClient,
} from './bullmq-event-publisher';

describe('BullMqEventPublisher', () => {
  const event = {
    eventId: '00000000-0000-4000-8000-000000000001',
    eventType: 'trip.created.v1',
    eventVersion: 1,
    occurredAt: '2026-08-29T00:00:00.000Z',
    correlationId: 'correlation-1',
    producer: 'core-trip-service',
    aggregateId: '00000000-0000-4000-8000-000000000002',
    payload: { tripId: '00000000-0000-4000-8000-000000000002' },
  };

  it('uses the integration event ID as the BullMQ job ID', async () => {
    const queue: jest.Mocked<QueueClient> = {
      add: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
    };
    const publisher = new BullMqEventPublisher(queue);

    await publisher.publish(event);
    await publisher.publish(event);

    expect(queue.add).toHaveBeenCalledTimes(2);
    expect(queue.add).toHaveBeenLastCalledWith('trip.created.v1', event, {
      jobId: event.eventId,
    });
  });

  it('closes its queue during Nest shutdown', async () => {
    const queue: jest.Mocked<QueueClient> = {
      add: jest.fn(),
      close: jest.fn().mockResolvedValue(undefined),
    };
    await new BullMqEventPublisher(queue).onModuleDestroy();
    expect(queue.close).toHaveBeenCalledTimes(1);
  });
});
