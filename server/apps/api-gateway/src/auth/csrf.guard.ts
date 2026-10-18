import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { GatewayConfig } from '@roadtrip/config';
import { Inject } from '@nestjs/common';
import type { Request } from 'express';
import { GATEWAY_AUTH_CONFIG } from './auth.types';
import { readCookies } from './session-cookies';

/** Applies only to browser cookie sessions; bearer clients use their bearer token. */
@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(
    @Inject(GATEWAY_AUTH_CONFIG) private readonly config: GatewayConfig,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    // Safe methods never alter cookie-authenticated state. This lets the guard
    // protect a controller which serves both reads and writes without forcing
    // browsers to send an Origin/CSRF header for ordinary navigation.
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method.toUpperCase())) {
      return true;
    }
    if (typeof request.headers.authorization === 'string') return true;
    const cookies = readCookies(request.headers.cookie);
    if (
      !cookies[this.config.AUTH_ACCESS_COOKIE_NAME] &&
      !cookies[this.config.AUTH_REFRESH_COOKIE_NAME]
    ) {
      return true;
    }
    const origin = request.headers.origin;
    const allowedOrigins = this.config.CORS_ALLOWED_ORIGINS.split(',').map(
      (value) => value.trim(),
    );
    const csrfHeader = request.headers['x-csrf-token'];
    if (
      !origin ||
      !allowedOrigins.includes(origin) ||
      typeof csrfHeader !== 'string' ||
      csrfHeader !== cookies[this.config.CSRF_COOKIE_NAME]
    ) {
      throw new ForbiddenException({
        error: { code: 'FORBIDDEN', message: 'CSRF validation failed.' },
        meta: { correlationId: request.headers['x-correlation-id'] ?? '' },
      });
    }
    return true;
  }
}
