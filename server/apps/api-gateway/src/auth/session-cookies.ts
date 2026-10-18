import type { GatewayConfig } from '@roadtrip/config';
import type { Response } from 'express';
import { randomBytes } from 'node:crypto';

export interface SupabaseSessionTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export function readCookies(
  header: string | undefined,
): Record<string, string> {
  if (!header) return {};
  return Object.fromEntries(
    header.split(';').flatMap((part) => {
      const index = part.indexOf('=');
      if (index < 1) return [];
      try {
        return [
          [
            part.slice(0, index).trim(),
            decodeURIComponent(part.slice(index + 1).trim()),
          ],
        ];
      } catch {
        return [];
      }
    }),
  );
}

export function setSessionCookies(
  response: Response,
  config: GatewayConfig,
  tokens: SupabaseSessionTokens,
): string {
  const domain = config.AUTH_COOKIE_DOMAIN
    ? { domain: config.AUTH_COOKIE_DOMAIN }
    : {};
  response.cookie(config.AUTH_ACCESS_COOKIE_NAME, tokens.accessToken, {
    ...domain,
    httpOnly: true,
    secure: config.AUTH_COOKIE_SECURE,
    sameSite: 'lax',
    path: '/',
    maxAge:
      Math.min(tokens.expiresIn, config.AUTH_ACCESS_COOKIE_MAX_AGE_SECONDS) *
      1_000,
  });
  response.cookie(config.AUTH_REFRESH_COOKIE_NAME, tokens.refreshToken, {
    ...domain,
    httpOnly: true,
    secure: config.AUTH_COOKIE_SECURE,
    sameSite: 'lax',
    path: '/api/v1/auth',
    maxAge: config.AUTH_REFRESH_COOKIE_MAX_AGE_SECONDS * 1_000,
  });
  const csrfToken = randomBytes(32).toString('base64url');
  response.cookie(config.CSRF_COOKIE_NAME, csrfToken, {
    httpOnly: false,
    secure: config.AUTH_COOKIE_SECURE,
    sameSite: 'lax',
    path: '/',
    maxAge: config.AUTH_REFRESH_COOKIE_MAX_AGE_SECONDS * 1_000,
  });
  return csrfToken;
}

export function clearSessionCookies(
  response: Response,
  config: GatewayConfig,
): void {
  const domain = config.AUTH_COOKIE_DOMAIN
    ? { domain: config.AUTH_COOKIE_DOMAIN }
    : {};
  for (const [name, path] of [
    [config.AUTH_ACCESS_COOKIE_NAME, '/'],
    [config.AUTH_REFRESH_COOKIE_NAME, '/api/v1/auth'],
    [config.CSRF_COOKIE_NAME, '/'],
  ] as const) {
    response.clearCookie(name, {
      ...domain,
      httpOnly: name !== config.CSRF_COOKIE_NAME,
      secure: config.AUTH_COOKIE_SECURE,
      sameSite: 'lax',
      path,
    });
  }
}
