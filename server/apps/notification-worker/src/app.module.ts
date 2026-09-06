import { Module } from '@nestjs/common';
import { HealthModule } from '@roadtrip/health';
import { NotificationDatabaseService } from './notification/notification-database.service';
import { NotificationEventHandler } from './notification/notification-event-handler';
import { BullMqNotificationConsumer } from './notification/bullmq-notification.consumer';

@Module({
  imports: [HealthModule.register({ service: 'notification-worker' })],
  providers: [
    NotificationDatabaseService,
    {
      provide: NotificationEventHandler,
      inject: [NotificationDatabaseService],
      useFactory: (database: NotificationDatabaseService) =>
        new NotificationEventHandler(database),
    },
    BullMqNotificationConsumer,
  ],
})
export class AppModule {}
