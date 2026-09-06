import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';
import {
  loadGeoLocationConfig,
  type GeoLocationConfig,
} from '@roadtrip/config';
import { getCorrelationId } from '@roadtrip/observability';
import { timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';

@Injectable()
export class GeoInternalGuard implements CanActivate {
  private readonly token = (loadGeoLocationConfig() as GeoLocationConfig)
    .INTERNAL_SERVICE_TOKEN;
  canActivate(context: ExecutionContext): boolean {
    const value = context
      .switchToHttp()
      .getRequest<Request>()
      .header('x-roadtrip-internal-token');
    if (!value || !same(value, this.token))
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
    return true;
  }
}
function same(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}
