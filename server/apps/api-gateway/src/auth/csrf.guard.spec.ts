import { ForbiddenException, type ExecutionContext } from '@nestjs/common';
import type { GatewayConfig } from '@roadtrip/config';
import { CsrfGuard } from './csrf.guard';

const config = {
  CORS_ALLOWED_ORIGINS: 'https://tripz.vn,http://localhost:3000',
  AUTH_ACCESS_COOKIE_NAME: 'rt_access',
  AUTH_REFRESH_COOKIE_NAME: 'rt_refresh',
  CSRF_COOKIE_NAME: 'rt_csrf',
} as GatewayConfig;

function context(
  method: string,
  headers: Record<string, string>,
): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ method, headers }) }),
  } as unknown as ExecutionContext;
}

describe('CsrfGuard', () => {
  const guard = new CsrfGuard(config);
  const cookie = 'rt_access=t; rt_csrf=token123';

  it('allows safe methods, bearer clients and cookie-less callers', () => {
    expect(guard.canActivate(context('GET', { cookie }))).toBe(true);
    expect(
      guard.canActivate(context('POST', { authorization: 'Bearer x', cookie })),
    ).toBe(true);
    expect(guard.canActivate(context('POST', {}))).toBe(true);
  });

  it('accepts an allowed origin with a matching CSRF header', () => {
    expect(
      guard.canActivate(
        context('POST', {
          cookie,
          origin: 'https://tripz.vn',
          'x-csrf-token': 'token123',
        }),
      ),
    ).toBe(true);
  });

  it.each([
    [
      'cross-origin',
      { origin: 'https://evil.example', 'x-csrf-token': 'token123' },
    ],
    ['missing origin', { 'x-csrf-token': 'token123' }],
    ['missing token', { origin: 'https://tripz.vn' }],
    ['wrong token', { origin: 'https://tripz.vn', 'x-csrf-token': 'nope' }],
  ])('rejects %s mutations', (_name, extra) => {
    expect(() =>
      guard.canActivate(context('PATCH', { cookie, ...extra })),
    ).toThrow(ForbiddenException);
  });
});
