import { Injectable, OnModuleDestroy } from '@nestjs/common';
import {
  loadNotificationWorkerConfig,
  type NotificationWorkerConfig,
} from '@roadtrip/config';
import { PostgresDatabase } from '@roadtrip/db-client';

@Injectable()
export class NotificationDatabaseService
  extends PostgresDatabase
  implements OnModuleDestroy
{
  constructor() {
    const config = loadNotificationWorkerConfig() as NotificationWorkerConfig;
    super({
      connectionString: config.DATABASE_URL,
      applicationName: 'notification-worker',
    });
  }
  onModuleDestroy(): Promise<void> {
    return this.close();
  }
}
