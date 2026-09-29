import { createHash } from 'node:crypto';
import type { OnModuleDestroy } from '@nestjs/common';
import type { Coordinate, VehicleMode } from '@roadtrip/contracts';
import Redis from 'ioredis';

export interface GeoRedisClient {
  get(key: string): Promise<string | null>;
  set(
    key: string,
    value: string,
    mode: 'EX',
    ttlSeconds: number,
  ): Promise<unknown>;
  disconnect(): void;
  on(event: 'error', listener: () => void): unknown;
}

export class GeoRedisCache implements OnModuleDestroy {
  private readonly client: GeoRedisClient;

  constructor(
    redisUrl: string,
    private readonly prefix: string,
    client?: GeoRedisClient,
  ) {
    this.client =
      client ??
      new Redis(redisUrl, {
        lazyConnect: true,
        connectTimeout: 1_000,
        enableOfflineQueue: false,
        maxRetriesPerRequest: 1,
        retryStrategy: () => null,
      });
    this.client.on('error', () => undefined);
  }

  searchKey(query: string, cursor?: string): string {
    return this.key('search', normalizeQuery(query), cursor?.trim() ?? '');
  }

  routeKey(coordinates: readonly Coordinate[], vehicle: VehicleMode): string {
    const points = coordinates.map(({ latitude, longitude }) => [
      latitude.toFixed(5),
      longitude.toFixed(5),
    ]);
    return this.key('route', vehicle, JSON.stringify(points));
  }

  async get<T>(key: string): Promise<T | undefined> {
    try {
      const value = await this.client.get(key);
      if (!value) return undefined;
      return JSON.parse(value) as T;
    } catch {
      return undefined;
    }
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch {
      // Redis is an optimization: cache failures must never affect correctness.
    }
  }

  onModuleDestroy(): void {
    this.client.disconnect();
  }

  private key(kind: 'search' | 'route', ...parts: readonly string[]): string {
    const digest = createHash('sha256')
      .update(parts.join('\u0000'))
      .digest('hex');
    return `${this.prefix}:geo:${kind}:${digest}`;
  }
}

function normalizeQuery(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('vi');
}
