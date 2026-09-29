import { Module } from '@nestjs/common';
import { HealthModule } from '@roadtrip/health';
import { loadGeoLocationConfig } from '@roadtrip/config';
import { GeoService } from './application/geo.service';
import { GeoRedisCache } from './infrastructure/cache/geo-redis-cache';
import { GeoMetrics } from './infrastructure/observability/geo-metrics';
import { VietMapAdapter } from './infrastructure/vietmap/vietmap.adapter';
import {
  GeoController,
  GeoMetricsController,
} from './presentation/geo.controller';
import { GeoInternalGuard } from './presentation/geo-internal.guard';

@Module({
  imports: [HealthModule.register({ service: 'geo-location-service' })],
  controllers: [GeoController, GeoMetricsController],
  providers: [
    GeoInternalGuard,
    GeoMetrics,
    {
      provide: VietMapAdapter,
      useFactory: () => {
        const config = loadGeoLocationConfig();
        return new VietMapAdapter({
          baseUrl: config.VIETMAP_BASE_URL,
          apiKey: config.VIETMAP_API_KEY,
          timeoutMs: config.VIETMAP_TIMEOUT_MS,
        });
      },
    },
    {
      provide: GeoRedisCache,
      useFactory: () => {
        const config = loadGeoLocationConfig();
        return new GeoRedisCache(config.REDIS_URL, config.REDIS_CACHE_PREFIX);
      },
    },
    {
      provide: GeoService,
      inject: [VietMapAdapter, GeoRedisCache, GeoMetrics],
      useFactory: (
        adapter: VietMapAdapter,
        cache: GeoRedisCache,
        metrics: GeoMetrics,
      ) => new GeoService(adapter, cache, loadGeoLocationConfig(), metrics),
    },
  ],
})
export class AppModule {}
