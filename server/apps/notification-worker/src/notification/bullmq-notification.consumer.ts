import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import {
  loadNotificationWorkerConfig,
  type NotificationWorkerConfig,
} from '@roadtrip/config';
import { Worker } from 'bullmq';
import { NotificationEventHandler } from './notification-event-handler';

@Injectable()
export class BullMqNotificationConsumer
  implements OnModuleInit, OnModuleDestroy
{
  private worker: Worker | undefined;
  constructor(private readonly handler: NotificationEventHandler) {}
  onModuleInit(): void {
    const config = loadNotificationWorkerConfig() as NotificationWorkerConfig;
    this.worker = new Worker(
      config.BULLMQ_QUEUE_NAME,
      async (job) => this.handler.handle(job.data),
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
