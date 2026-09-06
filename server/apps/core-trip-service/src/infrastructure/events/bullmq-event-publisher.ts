import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { loadCoreTripConfig, type CoreTripConfig } from '@roadtrip/config';
import { Queue, type JobsOptions } from 'bullmq';
import type {
  EventPublisher,
  IntegrationEvent,
} from '../../application/events/event-publisher.port';

export interface QueueClient {
  add(
    name: string,
    data: IntegrationEvent,
    options: JobsOptions,
  ): Promise<unknown>;
  close(): Promise<void>;
}

@Injectable()
export class BullMqEventPublisher implements EventPublisher, OnModuleDestroy {
  private readonly queue: QueueClient;

  constructor(queue?: QueueClient) {
    this.queue = queue ?? createQueue(loadCoreTripConfig() as CoreTripConfig);
  }

  async publish(event: IntegrationEvent): Promise<void> {
    await this.queue.add(event.eventType, event, { jobId: event.eventId });
  }

  async onModuleDestroy(): Promise<void> {
    await this.queue.close();
  }
}

function createQueue(config: CoreTripConfig): QueueClient {
  return new Queue<IntegrationEvent>(config.BULLMQ_QUEUE_NAME, {
    connection: { url: config.REDIS_URL },
    prefix: config.BULLMQ_QUEUE_PREFIX,
    defaultJobOptions: {
      attempts: config.BULLMQ_ATTEMPTS,
      backoff: { type: 'exponential', delay: config.BULLMQ_BACKOFF_MS },
      removeOnComplete: true,
      removeOnFail: config.BULLMQ_FAILED_RETENTION,
    },
  });
}
