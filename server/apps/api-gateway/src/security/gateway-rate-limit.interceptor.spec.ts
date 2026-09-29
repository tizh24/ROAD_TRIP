import {
  HttpException,
  type CallHandler,
  type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { GatewayConfig } from '@roadtrip/config';
import type { RateLimitStore } from './rate-limit.types';
import { GatewayRateLimitInterceptor } from './gateway-rate-limit.interceptor';
import { of } from 'rxjs';

describe('GatewayRateLimitInterceptor', () => {
  it('applies the route limit to concurrent requests without dropping responses', async () => {
    const counts = new Map<string, number>();
    const store: RateLimitStore = {
      consume(key, windowMs) {
        const count = (counts.get(key) ?? 0) + 1;
        counts.set(key, count);
        return Promise.resolve({ count, ttlMs: windowMs });
      },
    };
    const config = {
      RATE_LIMIT_MAX: 2,
      RATE_LIMIT_AUTHENTICATED_MAX: 10,
      RATE_LIMIT_WINDOW_MS: 60_000,
      REDIS_RATE_LIMIT_PREFIX: 'test:rate-limit',
    } as GatewayConfig;
    const reflector = {
      getAllAndOverride: () => undefined,
    } as unknown as Reflector;
    const interceptor = new GatewayRateLimitInterceptor(
      reflector,
      store,
      config,
    );
    const controller = class SecurityProbeController {};
    const handlerMethod = () => undefined;
    const callHandler: CallHandler = { handle: () => of(undefined) };
    const responseHeaders: Map<string, string>[] = [];

    const outcomes = await Promise.allSettled(
      Array.from({ length: 8 }, (_, index) => {
        const headers = new Map<string, string>();
        responseHeaders.push(headers);
        const request = {
          path: '/api/v1/security-probe',
          method: 'GET',
          ip: '127.0.0.1',
          headers: { 'x-correlation-id': `burst-${index}` },
        };
        const context = {
          switchToHttp: () => ({
            getRequest: () => request,
            getResponse: () => ({
              setHeader: (name: string, value: string | number) =>
                headers.set(name.toLowerCase(), String(value)),
            }),
          }),
          getHandler: () => handlerMethod,
          getClass: () => controller,
        } as unknown as ExecutionContext;

        return interceptor.intercept(context, callHandler);
      }),
    );

    const accepted = outcomes.filter(
      (outcome) => outcome.status === 'fulfilled',
    );
    const limited = outcomes.filter((outcome) => outcome.status === 'rejected');
    expect(accepted).toHaveLength(2);
    expect(limited).toHaveLength(6);
    limited.forEach((outcome) => {
      if (outcome.status !== 'rejected') return;
      const error: unknown = outcome.reason;
      expect(error).toBeInstanceOf(HttpException);
      if (!(error instanceof HttpException)) {
        throw new Error('Expected a rate-limit HttpException.');
      }
      expect(error.getStatus()).toBe(429);
    });
    expect(
      responseHeaders.filter((headers) => headers.get('retry-after') === '60'),
    ).toHaveLength(6);
  });
});
