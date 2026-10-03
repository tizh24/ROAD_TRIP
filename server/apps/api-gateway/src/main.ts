import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule } from '@nestjs/swagger';
import type { NextFunction, Request, Response } from 'express';
import { loadGatewayConfig } from '@roadtrip/config';
import { getCorrelationId, StructuredLogger } from '@roadtrip/observability';
import { AppModule } from './app.module';
import { configureGatewaySecurity } from './gateway-security';
import { createPublicOpenApiDocument } from './openapi';

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
  app.use(logGatewayRequest(logger));
  SwaggerModule.setup('api/docs', app, createPublicOpenApiDocument(), {
    jsonDocumentUrl: '/api/v1/openapi.json',
    yamlDocumentUrl: '/api/v1/openapi.yaml',
  });
  await app.listen(config.PORT);
}

function logGatewayRequest(logger: StructuredLogger) {
  return (request: Request, response: Response, next: NextFunction): void => {
    response.on('finish', () => {
      logger.log(
        {
          correlationId: getCorrelationId(),
          method: request.method,
          path: request.path,
          statusCode: response.statusCode,
        },
        'Gateway request completed',
      );
    });
    next();
  };
}

void bootstrap();
