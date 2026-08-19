import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { loadGatewayConfig } from '@roadtrip/config';
import { StructuredLogger } from '@roadtrip/observability';
import { AppModule } from './app.module';
import { configureGatewaySecurity } from './gateway-security';

async function bootstrap() {
  const config = loadGatewayConfig();
  const logger = new StructuredLogger({
    service: 'api-gateway',
    environment: config.NODE_ENV,
    level: config.LOG_LEVEL,
  });
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
    bufferLogs: true,
  });
  app.enableShutdownHooks();
  app.useLogger(logger);
  configureGatewaySecurity(app, config);
  await app.listen(config.PORT);
}
void bootstrap();
