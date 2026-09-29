import { Injectable } from '@nestjs/common';
import type { Place, RoutePreviewRequest } from '@roadtrip/contracts';
import type { GeoLocationConfig } from '@roadtrip/config';
import { GeoRedisCache } from '../infrastructure/cache/geo-redis-cache';
import { VietMapAdapter } from '../infrastructure/vietmap/vietmap.adapter';
import { GeoMetrics } from '../infrastructure/observability/geo-metrics';

@Injectable()
export class GeoService {
  private readonly pendingSearches = new Map<
    string,
    Promise<readonly Place[]>
  >();
  private readonly pendingRoutes = new Map<
    string,
    Promise<Awaited<ReturnType<VietMapAdapter['previewRoute']>>>
  >();

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
    const places = await this.coalesce(this.pendingSearches, key, async () => {
      const result = await this.adapter.searchPlaces(query);
      this.metrics.recordProviderCall(performance.now() - started);
      await this.cache.set(
        key,
        result,
        this.config.GEO_SEARCH_CACHE_TTL_SECONDS,
      );
      return result;
    });
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
    const preview = await this.coalesce(this.pendingRoutes, key, async () => {
      const result = await this.adapter.previewRoute(
        input.coordinates,
        input.vehicle,
      );
      this.metrics.recordProviderCall(performance.now() - started);
      await this.cache.set(
        key,
        result,
        this.config.GEO_ROUTE_CACHE_TTL_SECONDS,
      );
      return result;
    });
    return { preview, source: 'provider' };
  }

  private async coalesce<T>(
    pending: Map<string, Promise<T>>,
    key: string,
    work: () => Promise<T>,
  ): Promise<T> {
    const existing = pending.get(key);
    if (existing) return existing;
    const operation = work().finally(() => pending.delete(key));
    pending.set(key, operation);
    return operation;
  }
}
