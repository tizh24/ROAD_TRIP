import {
  All,
  Body,
  Controller,
  Inject,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { ErrorCode } from '@roadtrip/contracts';
import { getCorrelationId } from '@roadtrip/observability';
import type { Request, Response } from 'express';
import { CurrentUser } from '../auth/current-user.decorator';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import type { AuthenticatedUserContext } from '../auth/auth.types';
import { RateLimit } from '../security/rate-limit.types';
import {
  CORE_TRIP_UPSTREAM,
  GEO_LOCATION_UPSTREAM,
  type UpstreamClient,
  type UpstreamUnavailableError,
} from './upstream.types';

@Controller('api/v1')
@UseGuards(SupabaseAuthGuard)
@RateLimit('authenticated')
export class UpstreamController {
  constructor(
    @Inject(CORE_TRIP_UPSTREAM) private readonly coreTrip: UpstreamClient,
    @Inject(GEO_LOCATION_UPSTREAM) private readonly geoLocation: UpstreamClient,
  ) {}

  @All(['trips', 'trips/{*path}', 'trip-invitations/{*path}'])
  async proxyCoreTrip(
    @Req() request: Request,
    @Res() response: Response,
    @CurrentUser() user: AuthenticatedUserContext,
    @Body() body: unknown,
  ): Promise<void> {
    await this.proxy(request, response, user, body, this.coreTrip, {
      code: 'INTERNAL_ERROR',
      message: 'The trip service is temporarily unavailable.',
    });
  }

  @All(['places/search', 'routes/preview'])
  async proxyGeoLocation(
    @Req() request: Request,
    @Res() response: Response,
    @CurrentUser() user: AuthenticatedUserContext,
    @Body() body: unknown,
  ): Promise<void> {
    await this.proxy(request, response, user, body, this.geoLocation, {
      code: 'PLACE_PROVIDER_UNAVAILABLE',
      message: 'The location service is temporarily unavailable.',
    });
  }

  private async proxy(
    request: Request,
    response: Response,
    user: AuthenticatedUserContext,
    body: unknown,
    client: UpstreamClient,
    unavailable: UpstreamUnavailableError,
  ): Promise<void> {
    try {
      const upstream = await client.request({
        method: request.method,
        path: request.originalUrl,
        headers: {
          'x-correlation-id': getCorrelationId() ?? '',
          'x-roadtrip-user-id': user.userId,
          'x-roadtrip-user-role': user.role,
          ...(user.email ? { 'x-roadtrip-user-email': user.email } : {}),
          ...copyRequestHeaders(request),
        },
        ...(hasBody(request.method) ? { body } : {}),
      });
      response.status(upstream.status).json(upstream.body);
    } catch {
      const mapped = unavailable;
      response.status(503).json({
        error: { code: mapped.code, message: mapped.message },
        meta: { correlationId: getCorrelationId() ?? '' },
      });
    }
  }
}

function copyRequestHeaders(request: Request): Record<string, string> {
  const headers: Record<string, string> = {};
  for (const header of ['idempotency-key', 'if-match']) {
    const value = request.headers[header];
    if (typeof value === 'string') headers[header] = value;
  }
  return headers;
}

function hasBody(method: string): boolean {
  return !['GET', 'HEAD'].includes(method.toUpperCase());
}
