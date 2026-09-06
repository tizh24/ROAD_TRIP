import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { loadCoreTripConfig, type CoreTripConfig } from '@roadtrip/config';
import { getCorrelationId } from '@roadtrip/observability';
import { timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';

@Injectable()
export class InternalServiceGuard implements CanActivate {
  private readonly token = (loadCoreTripConfig() as CoreTripConfig)
    .INTERNAL_SERVICE_TOKEN;

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const supplied = request.header('x-roadtrip-internal-token');
    if (!supplied || !safeEqual(supplied, this.token)) {
      throw new HttpException(
        {
          error: {
            code: 'AUTH_INVALID',
            message: 'Internal authentication is required.',
          },
          meta: { correlationId: getCorrelationId() ?? 'unknown' },
        },
        401,
      );
    }
    return true;
  }
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}
