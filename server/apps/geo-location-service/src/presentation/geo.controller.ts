import {
  Body,
  Controller,
  Get,
  Header,
  HttpException,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  placeSearchQuerySchema,
  routePreviewRequestSchema,
} from '@roadtrip/contracts';
import { getCorrelationId } from '@roadtrip/observability';
import { GeoService } from '../application/geo.service';
import { VietMapError } from '../infrastructure/vietmap/vietmap.adapter';
import { GeoMetrics } from '../infrastructure/observability/geo-metrics';
import { GeoInternalGuard } from './geo-internal.guard';

@Controller('api/v1')
@UseGuards(GeoInternalGuard)
export class GeoController {
  constructor(private readonly geo: GeoService) {}
  @Get('places/search')
  async search(@Query() query: unknown) {
    try {
      const input = parse(placeSearchQuerySchema.safeParse(query));
      const result = await this.geo.search(input.q, input.cursor);
      return {
        data: result.places,
        meta: {
          correlationId: correlationId(),
          pagination: { nextCursor: null, hasMore: false },
        },
      };
    } catch (error) {
      throw geoError(error);
    }
  }
  @Post('routes/preview')
  async route(@Body() body: unknown) {
    try {
      const input = parse(routePreviewRequestSchema.safeParse(body));
      const result = await this.geo.route(input);
      return {
        data: {
          ...result.preview,
          source: result.source,
          calculatedAt: new Date().toISOString(),
        },
        meta: { correlationId: correlationId() },
      };
    } catch (error) {
      throw geoError(error);
    }
  }
}

@Controller('metrics')
export class GeoMetricsController {
  constructor(private readonly metrics: GeoMetrics) {}
  @Get()
  @Header('content-type', 'text/plain; version=0.0.4; charset=utf-8')
  get(): string {
    return this.metrics.renderPrometheus();
  }
}

function parse<T>(result: { success: true; data: T } | { success: false }): T {
  if (!result.success) throw new Error('validation');
  return result.data;
}
function correlationId(): string {
  return getCorrelationId() ?? 'unknown';
}
function geoError(error: unknown): HttpException {
  const code = error instanceof VietMapError ? error.code : 'VALIDATION_FAILED';
  const status = error instanceof VietMapError ? 503 : 400;
  return new HttpException(
    {
      error: {
        code,
        message:
          code === 'VALIDATION_FAILED'
            ? 'Request validation failed.'
            : 'Location service is temporarily unavailable.',
      },
      meta: { correlationId: correlationId() },
    },
    status,
  );
}
