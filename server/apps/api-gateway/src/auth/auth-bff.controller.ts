import {
  Body,
  Controller,
  HttpException,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Post,
  Req,
  Res,
  ServiceUnavailableException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { GatewayConfig } from '@roadtrip/config';
import { getCorrelationId } from '@roadtrip/observability';
import type { Request, Response } from 'express';
import {
  AUTH_TOKEN_VERIFIER,
  GATEWAY_AUTH_CONFIG,
  type AuthTokenVerifier,
} from './auth.types';
import { CsrfGuard } from './csrf.guard';
import {
  readCookies,
  clearSessionCookies,
  setSessionCookies,
} from './session-cookies';
import {
  AuthCredentials,
  SupabaseAuthClient,
  SupabaseAuthRequestError,
} from './supabase-auth.client';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { RateLimit } from '../security/rate-limit.types';

@Controller('api/v1/auth')
export class AuthBffController {
  private readonly auth: SupabaseAuthClient;
  private readonly logger = new Logger(AuthBffController.name);

  constructor(
    @Inject(GATEWAY_AUTH_CONFIG) private readonly config: GatewayConfig,
    @Inject(AUTH_TOKEN_VERIFIER) private readonly verifier: AuthTokenVerifier,
  ) {
    this.auth = new SupabaseAuthClient(config);
  }

  @Post('register')
  @RateLimit('public')
  async register(
    @Body() body: unknown,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const result = await this.auth.register(registrationCredentials(body));
      if (result.session)
        setSessionCookies(response, this.config, result.session);
      return success({ confirmationRequired: result.confirmationRequired });
    } catch (error) {
      if (error instanceof SupabaseAuthRequestError) {
        if (error.status === 429) throw authRateLimited();

        // A provider's duplicate-account response must remain indistinguishable
        // from a confirmation-required response to prevent account enumeration.
        if (error.status >= 400 && error.status < 500)
          return success({ confirmationRequired: true });
      }
      throw authUnavailable();
    }
  }

  @Post('login')
  @HttpCode(200)
  @RateLimit('public')
  async login(
    @Body() body: unknown,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      setSessionCookies(
        response,
        this.config,
        await this.auth.login(credentials(body)),
      );
      return success({ authenticated: true });
    } catch (error) {
      if (error instanceof SupabaseAuthRequestError) {
        this.logger.warn(`Supabase login rejected with status ${error.status}`);
        if (error.status === 429) throw authRateLimited();
        if (error.status >= 500) throw authUnavailable();
        return invalidCredentials();
      }
      this.logger.error('Supabase login request failed unexpectedly', error);
      throw authUnavailable();
    }
  }

  /**
   * Bridges a Supabase OAuth/PKCE callback into the same HttpOnly Gateway
   * session used by password login. The access token is verified before any
   * cookie is issued.
   */
  @Post('session/import')
  @HttpCode(200)
  @RateLimit('public')
  async importSession(
    @Body() body: unknown,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const session = importedSession(body);
      await this.verifier.verify(session.accessToken);
      setSessionCookies(response, this.config, session);
      return success({ authenticated: true });
    } catch {
      return invalidCredentials();
    }
  }

  @Post('refresh')
  @HttpCode(200)
  @UseGuards(CsrfGuard)
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = readCookies(request.headers.cookie)[
      this.config.AUTH_REFRESH_COOKIE_NAME
    ];
    if (!refreshToken) return invalidCredentials();
    try {
      setSessionCookies(
        response,
        this.config,
        await this.auth.refresh(refreshToken),
      );
      return success({ authenticated: true });
    } catch {
      clearSessionCookies(response, this.config);
      return invalidCredentials();
    }
  }

  @Post('logout')
  @HttpCode(200)
  @UseGuards(CsrfGuard)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const accessToken = readCookies(request.headers.cookie)[
      this.config.AUTH_ACCESS_COOKIE_NAME
    ];
    if (accessToken) {
      try {
        await this.auth.logout(accessToken);
      } catch {
        // Clear a local session even if Supabase is temporarily unavailable.
      }
    }
    clearSessionCookies(response, this.config);
    return success({ authenticated: false });
  }

  @Post('password/reset')
  @HttpCode(202)
  @RateLimit('public')
  async passwordReset(@Body() body: unknown) {
    const email = emailFrom(body);
    if (email) {
      try {
        await this.auth.requestPasswordReset(
          email,
          this.config.CORS_ALLOWED_ORIGINS.split(',')[0]?.trim() ?? '',
        );
      } catch {
        // Deliberately indistinguishable from a successful request.
      }
    }
    return success({ accepted: true });
  }

  @Post('password/change')
  @HttpCode(200)
  @UseGuards(SupabaseAuthGuard, CsrfGuard)
  async changePassword(@Req() request: Request, @Body() body: unknown) {
    const authorization = request.headers.authorization;
    const accessToken =
      typeof authorization === 'string'
        ? /^Bearer ([^\s]+)$/i.exec(authorization)?.[1]
        : readCookies(request.headers.cookie)[
            this.config.AUTH_ACCESS_COOKIE_NAME
          ];
    if (!accessToken) return invalidCredentials();
    try {
      await this.auth.changePassword(accessToken, passwordFrom(body));
      return success({ changed: true });
    } catch {
      return invalidCredentials();
    }
  }
}

function credentials(body: unknown): AuthCredentials {
  const email = emailFrom(body);
  const value = body as Record<string, unknown> | null;
  const password =
    value && typeof value.password === 'string' ? value.password : '';
  if (!email || password.length < 8 || password.length > 256)
    throw new SupabaseAuthRequestError(400);
  return { email, password };
}

function registrationCredentials(body: unknown): AuthCredentials {
  const credentialsForLogin = credentials(body);
  const value = body as Record<string, unknown> | null;
  const fullName =
    value && typeof value.fullName === 'string' ? value.fullName.trim() : '';
  if (fullName.length < 2 || fullName.length > 80) {
    throw new SupabaseAuthRequestError(400);
  }
  return { ...credentialsForLogin, fullName };
}

function emailFrom(body: unknown): string | undefined {
  const value = body as Record<string, unknown> | null;
  const email =
    value && typeof value.email === 'string'
      ? value.email.trim().toLowerCase()
      : undefined;
  return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : undefined;
}

function passwordFrom(body: unknown): string {
  const value = body as Record<string, unknown> | null;
  const password =
    value && typeof value.password === 'string' ? value.password : undefined;
  if (!password || password.length < 8 || password.length > 256) {
    throw new SupabaseAuthRequestError(400);
  }
  return password;
}

function importedSession(body: unknown) {
  if (typeof body !== 'object' || body === null) {
    throw new SupabaseAuthRequestError(400);
  }
  const value = body as Record<string, unknown>;
  if (
    typeof value.accessToken !== 'string' ||
    typeof value.refreshToken !== 'string' ||
    typeof value.expiresIn !== 'number' ||
    !Number.isFinite(value.expiresIn) ||
    value.expiresIn <= 0
  ) {
    throw new SupabaseAuthRequestError(400);
  }
  return {
    accessToken: value.accessToken,
    refreshToken: value.refreshToken,
    expiresIn: Math.floor(value.expiresIn),
  };
}

function success(data: object) {
  return { data, meta: { correlationId: getCorrelationId() ?? '' } };
}

function invalidCredentials() {
  throw new UnauthorizedException({
    error: { code: 'AUTH_INVALID', message: 'Email or password is invalid.' },
    meta: { correlationId: getCorrelationId() ?? '' },
  });
}

function authRateLimited() {
  return new HttpException(
    {
      error: {
        code: 'AUTH_RATE_LIMITED',
        message: 'Too many authentication requests. Please try again later.',
      },
      meta: { correlationId: getCorrelationId() ?? '' },
    },
    HttpStatus.TOO_MANY_REQUESTS,
  );
}

function authUnavailable() {
  return new ServiceUnavailableException({
    error: {
      code: 'AUTH_UNAVAILABLE',
      message: 'Authentication service is temporarily unavailable.',
    },
    meta: { correlationId: getCorrelationId() ?? '' },
  });
}
