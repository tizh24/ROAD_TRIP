import { NestFactory } from '@nestjs/core';
import { loadGatewayConfig } from '@roadtrip/config';
import {
  correlationIdMiddleware,
  StructuredLogger,
} from '@roadtrip/observability';
import { AppModule } from './app.module';

async function bootstrap() {
  const config = loadGatewayConfig();
  const logger = new StructuredLogger({
    service: 'api-gateway',
    environment: config.NODE_ENV,
    level: config.LOG_LEVEL,
  });
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.enableShutdownHooks();
  app.useLogger(logger);
  app.use(correlationIdMiddleware());
  await app.listen(config.PORT);
}
void bootstrap();
