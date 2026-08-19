import { SetMetadata } from '@nestjs/common';

export type RateLimitClass = 'public' | 'authenticated';

export interface RateLimitResult {
  count: number;
  ttlMs: number;
}

export interface RateLimitStore {
  consume(key: string, windowMs: number): Promise<RateLimitResult>;
}

export const RATE_LIMIT_STORE = Symbol('RATE_LIMIT_STORE');
export const RATE_LIMIT_CLASS = Symbol('RATE_LIMIT_CLASS');

export const RateLimit = (routeClass: RateLimitClass) =>
  SetMetadata(RATE_LIMIT_CLASS, routeClass);
