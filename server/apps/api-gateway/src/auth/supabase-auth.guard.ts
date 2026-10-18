import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import type { GatewayConfig } from '@roadtrip/config';
import { authError } from './auth.errors';
import {
  AUTH_TOKEN_VERIFIER,
  GATEWAY_AUTH_CONFIG,
  type AuthenticatedUserContext,
  type AuthTokenVerifier,
} from './auth.types';
import {
  InactiveAccountError,
  PlatformAuthorizationService,
  PlatformProfileNotFoundError,
  PlatformProfileUnavailableError,
} from './platform-authorization.service';
import { readCookies } from './session-cookies';

export interface AuthenticatedRequest extends Request {
  auth?: AuthenticatedUserContext;
}

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    @Inject(AUTH_TOKEN_VERIFIER)
    private readonly verifier: AuthTokenVerifier,
    @Inject(GATEWAY_AUTH_CONFIG)
    private readonly config: GatewayConfig,
    private readonly platformAuthorization: PlatformAuthorizationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.tokenFrom(request);
    if (!token) {
      throw authError('AUTH_REQUIRED', request.headers);
    }

    try {
      request.auth = await this.platformAuthorization.enrich(
        await this.verifier.verify(token),
      );
      return true;
    } catch (error) {
      if (error instanceof InactiveAccountError) {
        throw authError('ACCOUNT_INACTIVE', request.headers);
      }
      if (error instanceof PlatformProfileNotFoundError) {
        throw authError('AUTH_INVALID', request.headers);
      }
      if (error instanceof PlatformProfileUnavailableError) {
        throw authError('AUTH_UNAVAILABLE', request.headers);
      }
      throw authError('AUTH_INVALID', request.headers);
    }
  }

  private tokenFrom(request: Request): string | undefined {
    const authorization = request.headers.authorization;
    if (typeof authorization === 'string') {
      return /^Bearer ([^\s]+)$/i.exec(authorization)?.[1];
    }
    return readCookies(request.headers.cookie)[
      this.config.AUTH_ACCESS_COOKIE_NAME
    ];
  }
}
