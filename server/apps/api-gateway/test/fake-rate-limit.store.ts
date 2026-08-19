import type {
  RateLimitResult,
  RateLimitStore,
} from '../src/security/rate-limit.types';

export class FakeRateLimitStore implements RateLimitStore {
  readonly consumedKeys: string[] = [];
  failure: Error | undefined;
  private readonly counts = new Map<string, number>();

  async consume(key: string, windowMs: number): Promise<RateLimitResult> {
    if (this.failure) throw this.failure;
    this.consumedKeys.push(key);
    const count = (this.counts.get(key) ?? 0) + 1;
    this.counts.set(key, count);
    return Promise.resolve({ count, ttlMs: windowMs });
  }

  reset(): void {
    this.consumedKeys.length = 0;
    this.counts.clear();
    this.failure = undefined;
  }
}
