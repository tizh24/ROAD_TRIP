import {
  RedisRateLimitStore,
  type RedisRateLimitClient,
} from './redis-rate-limit.store';

class FakeRedisClient implements RedisRateLimitClient {
  status = 'wait';
  disconnected = false;
  evalArguments: unknown[] = [];
  result: unknown = [1, 60_000];

  connect(): Promise<unknown> {
    this.status = 'ready';
    return Promise.resolve();
  }

  eval(...args: [string, number, string, number]): Promise<unknown> {
    this.evalArguments = args;
    return Promise.resolve(this.result);
  }

  disconnect(): void {
    this.disconnected = true;
  }

  on(): unknown {
    return this;
  }
}

describe('RedisRateLimitStore', () => {
  it('atomically increments a prefixed key and applies the window TTL', async () => {
    const client = new FakeRedisClient();
    const store = new RedisRateLimitStore('redis://unused', client);

    await expect(
      store.consume('roadtrip:rate-limit:key', 60_000),
    ).resolves.toEqual({ count: 1, ttlMs: 60_000 });
    expect(client.evalArguments[0]).toContain("redis.call('INCR', KEYS[1])");
    expect(client.evalArguments[0]).toContain("redis.call('PEXPIRE'");
    expect(client.evalArguments.slice(1)).toEqual([
      1,
      'roadtrip:rate-limit:key',
      60_000,
    ]);
  });

  it('rejects malformed Redis results and disconnects on shutdown', async () => {
    const client = new FakeRedisClient();
    client.result = ['1', -1];
    const store = new RedisRateLimitStore('redis://unused', client);

    await expect(store.consume('key', 1_000)).rejects.toThrow(
      'Redis returned an invalid rate-limit result',
    );
    store.onModuleDestroy();
    expect(client.disconnected).toBe(true);
  });
});
