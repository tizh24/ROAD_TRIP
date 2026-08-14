import { NestFactory } from '@nestjs/core';
import { loadGeoLocationConfig } from '@roadtrip/config';
import {
  correlationIdMiddleware,
  StructuredLogger,
} from '@roadtrip/observability';
import { AppModule } from './app.module';

async function bootstrap() {
  const config = loadGeoLocationConfig();
  const logger = new StructuredLogger({
    service: 'geo-location-service',
    environment: config.NODE_ENV,
    level: config.LOG_LEVEL,
  });
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(logger);
  app.use(correlationIdMiddleware());
  await app.listen(config.PORT);
}
void bootstrap();
