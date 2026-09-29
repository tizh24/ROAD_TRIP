import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { loadGatewayConfig } from '@roadtrip/config';
import {
  GATEWAY_RATE_LIMIT_CONFIG,
  GatewayRateLimitInterceptor,
} from './gateway-rate-limit.interceptor';
import { RATE_LIMIT_STORE } from './rate-limit.types';
import { RedisRateLimitStore } from './redis-rate-limit.store';

@Module({
  providers: [
    {
      provide: GATEWAY_RATE_LIMIT_CONFIG,
      useFactory: () => loadGatewayConfig(),
    },
    {
      provide: RATE_LIMIT_STORE,
      inject: [GATEWAY_RATE_LIMIT_CONFIG],
      useFactory: (config: ReturnType<typeof loadGatewayConfig>) =>
        new RedisRateLimitStore(config.REDIS_URL),
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: GatewayRateLimitInterceptor,
    },
  ],
  exports: [RATE_LIMIT_STORE],
})
export class SecurityModule {}
