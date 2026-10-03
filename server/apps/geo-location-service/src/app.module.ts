import { Module } from '@nestjs/common';
import { HealthModule } from '@roadtrip/health';
import { loadGeoLocationConfig } from '@roadtrip/config';
import { GeoService } from './application/geo.service';
import { GeoRedisCache } from './infrastructure/cache/geo-redis-cache';
import { GeoMetrics } from './infrastructure/observability/geo-metrics';
import { LocationIqAdapter } from './infrastructure/locationiq/locationiq.adapter';
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
      provide: LocationIqAdapter,
      useFactory: () => {
        const config = loadGeoLocationConfig();
        return new LocationIqAdapter({
          baseUrl: config.LOCATIONIQ_BASE_URL,
          apiKey: config.LOCATIONIQ_API_KEY,
          timeoutMs: config.LOCATIONIQ_TIMEOUT_MS,
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
      inject: [LocationIqAdapter, GeoRedisCache, GeoMetrics],
      useFactory: (
        adapter: LocationIqAdapter,
        cache: GeoRedisCache,
        metrics: GeoMetrics,
      ) => new GeoService(adapter, cache, loadGeoLocationConfig(), metrics),
    },
  ],
})
export class AppModule {}
