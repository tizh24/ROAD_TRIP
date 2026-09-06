import { Injectable } from '@nestjs/common';
import type { Place, RoutePreviewRequest } from '@roadtrip/contracts';
import type { GeoLocationConfig } from '@roadtrip/config';
import { GeoRedisCache } from '../infrastructure/cache/geo-redis-cache';
import { VietMapAdapter } from '../infrastructure/vietmap/vietmap.adapter';
import { GeoMetrics } from '../infrastructure/observability/geo-metrics';

@Injectable()
export class GeoService {
  constructor(
    private readonly adapter: VietMapAdapter,
    private readonly cache: GeoRedisCache,
    private readonly config: GeoLocationConfig,
    private readonly metrics: GeoMetrics,
  ) {}

  async search(
    query: string,
    cursor?: string,
  ): Promise<{ places: readonly Place[]; source: 'cache' | 'provider' }> {
    const key = this.cache.searchKey(query, cursor);
    const cached = await this.cache.get<readonly Place[]>(key);
    if (cached) {
      this.metrics.recordCacheHit();
      return { places: cached, source: 'cache' };
    }
    this.metrics.recordCacheMiss();
    const started = performance.now();
    const places = await this.adapter.searchPlaces(query);
    this.metrics.recordProviderCall(performance.now() - started);
    await this.cache.set(key, places, this.config.GEO_SEARCH_CACHE_TTL_SECONDS);
    return { places, source: 'provider' };
  }

  async route(input: RoutePreviewRequest): Promise<{
    preview: Awaited<ReturnType<VietMapAdapter['previewRoute']>>;
    source: 'cache' | 'provider';
  }> {
    const key = this.cache.routeKey(input.coordinates, input.vehicle);
    const cached =
      await this.cache.get<Awaited<ReturnType<VietMapAdapter['previewRoute']>>>(
        key,
      );
    if (cached) {
      this.metrics.recordCacheHit();
      return { preview: cached, source: 'cache' };
    }
    this.metrics.recordCacheMiss();
    const started = performance.now();
    const preview = await this.adapter.previewRoute(
      input.coordinates,
      input.vehicle,
    );
    this.metrics.recordProviderCall(performance.now() - started);
    await this.cache.set(key, preview, this.config.GEO_ROUTE_CACHE_TTL_SECONDS);
    return { preview, source: 'provider' };
  }
}
