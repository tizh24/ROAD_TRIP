import type { GeoLocationConfig } from '@roadtrip/config';
import { GeoService } from './geo.service';
import { GeoMetrics } from '../infrastructure/observability/geo-metrics';

describe('GeoService resilience smoke', () => {
  it('coalesces a burst of equivalent searches into one provider call', async () => {
    const values = new Map<string, unknown>();
    const cache = {
      searchKey: (query: string) =>
        query.trim().replace(/\s+/g, ' ').toLowerCase(),
      routeKey: jest.fn(),
      get: jest.fn((key: string) => Promise.resolve(values.get(key))),
      set: jest.fn((key: string, value: unknown) => {
        values.set(key, value);
        return Promise.resolve();
      }),
    };
    const adapter = {
      searchPlaces: jest.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 5));
        return [
          {
            id: 'place-1',
            name: 'Da Nang',
            address: 'Hai Chau',
            coordinate: { latitude: 16.05, longitude: 108.2 },
          },
        ];
      }),
      previewRoute: jest.fn(),
    };
    const config = {
      GEO_SEARCH_CACHE_TTL_SECONDS: 300,
      GEO_ROUTE_CACHE_TTL_SECONDS: 300,
    };
    const service = new GeoService(
      adapter as never,
      cache as never,
      config as GeoLocationConfig,
      new GeoMetrics(),
    );

    const results = await Promise.all(
      Array.from({ length: 20 }, () => service.search('  Da   Nang  ')),
    );

    expect(results).toHaveLength(20);
    expect(adapter.searchPlaces).toHaveBeenCalledTimes(1);
    await expect(service.search('da nang')).resolves.toMatchObject({
      source: 'cache',
    });
    expect(adapter.searchPlaces).toHaveBeenCalledTimes(1);
  });

  it('releases a failed in-flight request so a later retry can succeed', async () => {
    const cache = {
      searchKey: (query: string) => query,
      routeKey: jest.fn(),
      get: jest.fn().mockResolvedValue(undefined),
      set: jest.fn().mockResolvedValue(undefined),
    };
    const adapter = {
      searchPlaces: jest
        .fn()
        .mockRejectedValueOnce(new Error('provider unavailable'))
        .mockResolvedValueOnce([]),
      previewRoute: jest.fn(),
    };
    const service = new GeoService(
      adapter as never,
      cache as never,
      {
        GEO_SEARCH_CACHE_TTL_SECONDS: 300,
        GEO_ROUTE_CACHE_TTL_SECONDS: 300,
      } as GeoLocationConfig,
      new GeoMetrics(),
    );

    await expect(service.search('retry')).rejects.toThrow(
      'provider unavailable',
    );
    await expect(service.search('retry')).resolves.toMatchObject({
      source: 'provider',
    });
    expect(adapter.searchPlaces).toHaveBeenCalledTimes(2);
  });
});
