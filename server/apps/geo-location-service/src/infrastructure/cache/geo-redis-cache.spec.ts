import { GeoRedisCache, type GeoRedisClient } from './geo-redis-cache';

class FakeRedis implements GeoRedisClient {
  readonly values = new Map<string, string>();
  readonly set = jest.fn(async (key: string, value: string) => {
    this.values.set(key, value);
  });
  readonly get = jest.fn(async (key: string) => this.values.get(key) ?? null);
  disconnect = jest.fn();
  on = jest.fn();
}

describe('GeoRedisCache', () => {
  it('normalizes equivalent search input into one cache key', () => {
    const cache = new GeoRedisCache(
      'redis://unused',
      'roadtrip:cache',
      new FakeRedis(),
    );
    expect(cache.searchKey('  Đà   Nẵng ')).toBe(cache.searchKey('đà nẵng'));
  });

  it('preserves route order while rounding coordinates for cache lookup', () => {
    const cache = new GeoRedisCache(
      'redis://unused',
      'roadtrip:cache',
      new FakeRedis(),
    );
    const first = [
      { latitude: 16.0544061, longitude: 108.2021669 },
      { latitude: 16.067, longitude: 108.22 },
    ];
    const rounded = [
      { latitude: 16.0544062, longitude: 108.2021668 },
      { latitude: 16.067, longitude: 108.22 },
    ];
    expect(cache.routeKey(first, 'car')).toBe(cache.routeKey(rounded, 'car'));
    expect(cache.routeKey([...first].reverse(), 'car')).not.toBe(
      cache.routeKey(first, 'car'),
    );
  });

  it('uses cached values and fails open when Redis is unavailable', async () => {
    const client = new FakeRedis();
    const cache = new GeoRedisCache('redis://unused', 'roadtrip:cache', client);
    const key = cache.searchKey('Da Nang');
    await cache.set(key, [{ id: 'place-1' }], 300);
    await expect(cache.get(key)).resolves.toEqual([{ id: 'place-1' }]);
    client.get.mockRejectedValueOnce(new Error('Redis down'));
    await expect(cache.get(key)).resolves.toBeUndefined();
  });
});
