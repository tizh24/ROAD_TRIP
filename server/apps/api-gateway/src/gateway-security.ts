import type { GatewayConfig } from '@roadtrip/config';
import type { ErrorResponse } from '@roadtrip/contracts';
import {
  CORRELATION_ID_HEADER,
  correlationIdMiddleware,
  getCorrelationId,
  normalizeCorrelationId,
} from '@roadtrip/observability';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';

export function configureGatewaySecurity(
  app: NestExpressApplication,
  config: GatewayConfig,
): void {
  app.use(helmet());

  const allowedOrigins = new Set(
    config.CORS_ALLOWED_ORIGINS.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  );
  app.enableCors({
    origin: (origin, callback) =>
      callback(null, origin === undefined || allowedOrigins.has(origin)),
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Authorization',
      'Content-Type',
      'Idempotency-Key',
      'If-Match',
      'X-Correlation-ID',
    ],
    exposedHeaders: [
      'RateLimit-Limit',
      'RateLimit-Remaining',
      'RateLimit-Reset',
      'Retry-After',
      'X-Correlation-ID',
    ],
  });
  app.use(correlationIdMiddleware());

  const bodyLimit = `${config.REQUEST_BODY_LIMIT_BYTES}b`;
  app.useBodyParser('json', { limit: bodyLimit });
  app.useBodyParser('urlencoded', { extended: false, limit: bodyLimit });
  app.use(
    (
      error: unknown,
      request: Request,
      response: Response,
      next: NextFunction,
    ) => {
      if (!isPayloadTooLarge(error)) {
        next(error);
        return;
      }

      const body: ErrorResponse = {
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Request body is too large.',
        },
        meta: {
          correlationId:
            getCorrelationId() ??
            normalizeCorrelationId(request.headers[CORRELATION_ID_HEADER]),
        },
      };
      response.status(413).json(body);
    },
  );
}

function isPayloadTooLarge(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    error.type === 'entity.too.large'
  );
}
