import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Inject,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { GatewayConfig } from '@roadtrip/config';
import type { ErrorResponse } from '@roadtrip/contracts';
import {
  CORRELATION_ID_HEADER,
  getCorrelationId,
  normalizeCorrelationId,
} from '@roadtrip/observability';
import { createHash } from 'node:crypto';
import type { Request, Response } from 'express';
import type { Observable } from 'rxjs';
import type { AuthenticatedRequest } from '../auth/supabase-auth.guard';
import {
  RATE_LIMIT_CLASS,
  RATE_LIMIT_STORE,
  type RateLimitClass,
  type RateLimitStore,
} from './rate-limit.types';

export const GATEWAY_RATE_LIMIT_CONFIG = Symbol('GATEWAY_RATE_LIMIT_CONFIG');

@Injectable()
export class GatewayRateLimitInterceptor implements NestInterceptor {
  private readonly logger = new Logger(GatewayRateLimitInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    @Inject(RATE_LIMIT_STORE) private readonly store: RateLimitStore,
    @Inject(GATEWAY_RATE_LIMIT_CONFIG)
    private readonly config: GatewayConfig,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.path.startsWith('/api/v1')) return next.handle();

    const routeClass =
      this.reflector.getAllAndOverride<RateLimitClass>(RATE_LIMIT_CLASS, [
        context.getHandler(),
        context.getClass(),
      ]) ?? 'public';
    const limit =
      routeClass === 'authenticated'
        ? this.config.RATE_LIMIT_AUTHENTICATED_MAX
        : this.config.RATE_LIMIT_MAX;
    const tracker = this.trackerFor(request, routeClass);
    const route = `${request.method}:${context.getClass().name}.${context.getHandler().name}`;
    const key = `${this.config.REDIS_RATE_LIMIT_PREFIX}:${routeClass}:${route}:${this.hash(tracker)}`;

    try {
      const result = await this.store.consume(
        key,
        this.config.RATE_LIMIT_WINDOW_MS,
      );
      const response = context.switchToHttp().getResponse<Response>();
      const resetSeconds = Math.max(1, Math.ceil(result.ttlMs / 1_000));
      response.setHeader('RateLimit-Limit', limit);
      response.setHeader(
        'RateLimit-Remaining',
        Math.max(0, limit - result.count),
      );
      response.setHeader('RateLimit-Reset', resetSeconds);

      if (result.count > limit) {
        response.setHeader('Retry-After', resetSeconds);
        throw this.rateLimitError(request);
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.warn({
        event: 'rate_limit_store_unavailable',
        routeClass,
      });
    }

    return next.handle();
  }

  private trackerFor(
    request: AuthenticatedRequest,
    routeClass: RateLimitClass,
  ): string {
    if (routeClass === 'authenticated' && request.auth?.userId) {
      return `user:${request.auth.userId}`;
    }
    return `ip:${request.ip ?? request.socket.remoteAddress ?? 'unknown'}`;
  }

  private hash(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }

  private rateLimitError(request: Request): HttpException {
    const body: ErrorResponse = {
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests. Try again later.',
      },
      meta: {
        correlationId:
          getCorrelationId() ??
          normalizeCorrelationId(request.headers[CORRELATION_ID_HEADER]),
      },
    };
    return new HttpException(body, 429);
  }
}
