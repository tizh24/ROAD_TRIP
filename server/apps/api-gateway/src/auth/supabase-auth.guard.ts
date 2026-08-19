import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import { authError } from './auth.errors';
import {
  AUTH_TOKEN_VERIFIER,
  type AuthenticatedUserContext,
  type AuthTokenVerifier,
} from './auth.types';

export interface AuthenticatedRequest extends Request {
  auth?: AuthenticatedUserContext;
}

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    @Inject(AUTH_TOKEN_VERIFIER)
    private readonly verifier: AuthTokenVerifier,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;

    if (typeof authorization !== 'string') {
      throw authError('AUTH_REQUIRED', request.headers);
    }

    const match = /^Bearer ([^\s]+)$/i.exec(authorization);
    if (!match?.[1]) {
      throw authError('AUTH_INVALID', request.headers);
    }

    try {
      request.auth = await this.verifier.verify(match[1]);
      return true;
    } catch {
      throw authError('AUTH_INVALID', request.headers);
    }
  }
}
