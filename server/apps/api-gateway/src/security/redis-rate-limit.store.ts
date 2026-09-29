import { Injectable, type OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import type { RateLimitResult, RateLimitStore } from './rate-limit.types';

const consumeScript = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
end
local ttl = redis.call('PTTL', KEYS[1])
return {count, ttl}
`;

export interface RedisRateLimitClient {
  readonly status: string;
  connect(): Promise<unknown>;
  eval(
    script: string,
    numberOfKeys: number,
    key: string,
    windowMs: number,
  ): Promise<unknown>;
  disconnect(): void;
  on(event: 'error', listener: () => void): unknown;
}

@Injectable()
export class RedisRateLimitStore implements RateLimitStore, OnModuleDestroy {
  private readonly client: RedisRateLimitClient;
  private connecting: Promise<void> | undefined;

  constructor(redisUrl: string, client?: RedisRateLimitClient) {
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

  async consume(key: string, windowMs: number): Promise<RateLimitResult> {
    await this.ensureConnected();
    const result = await this.client.eval(consumeScript, 1, key, windowMs);

    if (
      !Array.isArray(result) ||
      typeof result[0] !== 'number' ||
      typeof result[1] !== 'number'
    ) {
      throw new Error('Redis returned an invalid rate-limit result');
    }

    return { count: result[0], ttlMs: Math.max(result[1], 0) };
  }

  onModuleDestroy(): void {
    this.client.disconnect();
  }

  private async ensureConnected(): Promise<void> {
    if (this.client.status === 'ready') return;
    this.connecting ??= this.client
      .connect()
      .then(() => undefined)
      .finally(() => {
        this.connecting = undefined;
      });
    await this.connecting;
  }
}
