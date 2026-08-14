import { NestFactory } from '@nestjs/core';
import { loadNotificationWorkerConfig } from '@roadtrip/config';
import {
  correlationIdMiddleware,
  StructuredLogger,
} from '@roadtrip/observability';
import { AppModule } from './app.module';

async function bootstrap() {
  const config = loadNotificationWorkerConfig();
  const logger = new StructuredLogger({
    service: 'notification-worker',
    environment: config.NODE_ENV,
    level: config.LOG_LEVEL,
  });
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(logger);
  app.use(correlationIdMiddleware());
  await app.listen(config.PORT);
}
void bootstrap();
