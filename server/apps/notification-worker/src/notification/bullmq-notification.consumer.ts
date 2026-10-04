import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { loadNotificationWorkerConfig } from '@roadtrip/config';
import { Worker } from 'bullmq';
import { NotificationEventHandler } from './notification-event-handler';

@Injectable()
export class BullMqNotificationConsumer
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(BullMqNotificationConsumer.name);
  private worker: Worker | undefined;
  constructor(private readonly handler: NotificationEventHandler) {}
  onModuleInit(): void {
    const config = loadNotificationWorkerConfig();
    this.worker = new Worker(
      config.BULLMQ_QUEUE_NAME,
      async (job) => {
        await this.handler.handle(job.data);
        const event = job.data as {
          eventId?: unknown;
          eventType?: unknown;
          correlationId?: unknown;
        };
        this.logger.log(
          {
            eventId: event.eventId,
            eventType: event.eventType,
            correlationId: event.correlationId,
          },
          'Notification event delivered',
        );
      },
      {
        connection: { url: config.REDIS_URL },
        prefix: config.BULLMQ_QUEUE_PREFIX,
        concurrency: config.BULLMQ_CONCURRENCY,
      },
    );
  }
  async onModuleDestroy(): Promise<void> {
    await this.worker?.close();
  }
}
