import type { GatewayConfig } from '@roadtrip/config';
import type { Response } from 'express';
import {
  clearSessionCookies,
  readCookies,
  setSessionCookies,
} from './session-cookies';

const config = {
  AUTH_COOKIE_DOMAIN: 'tripz.vn',
  AUTH_COOKIE_SECURE: true,
  AUTH_ACCESS_COOKIE_NAME: '__Secure-rt_access',
  AUTH_REFRESH_COOKIE_NAME: '__Secure-rt_refresh',
  CSRF_COOKIE_NAME: '__Secure-rt_csrf',
  AUTH_ACCESS_COOKIE_MAX_AGE_SECONDS: 900,
  AUTH_REFRESH_COOKIE_MAX_AGE_SECONDS: 2_592_000,
} as GatewayConfig;

function fakeResponse() {
  const cookies: Array<[string, string, Record<string, unknown>]> = [];
  const cleared: Array<[string, Record<string, unknown>]> = [];
  const response = {
    cookie: (n: string, v: string, o: Record<string, unknown>) =>
      cookies.push([n, v, o]),
    clearCookie: (n: string, o: Record<string, unknown>) =>
      cleared.push([n, o]),
  } as unknown as Response;
  return { response, cookies, cleared };
}

describe('session cookies', () => {
  it('sets HttpOnly secure token cookies with scoped path, domain and ages', () => {
    const { response, cookies } = fakeResponse();
    const csrf = setSessionCookies(response, config, {
      accessToken: 'a',
      refreshToken: 'r',
      expiresIn: 3_600,
    });
    const [access, refresh, csrfCookie] = cookies;
    expect(access?.[2]).toMatchObject({
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      domain: 'tripz.vn',
      maxAge: 900_000,
    });
    expect(refresh?.[2]).toMatchObject({
      httpOnly: true,
      path: '/api/v1/auth',
      maxAge: 2_592_000_000,
    });
    expect(csrfCookie?.[2]).toMatchObject({ httpOnly: false, secure: true });
    expect(csrfCookie?.[1]).toBe(csrf);
    expect(csrf.length).toBeGreaterThanOrEqual(32);
  });

  it('caps the access cookie at the provider token lifetime', () => {
    const { response, cookies } = fakeResponse();
    setSessionCookies(response, config, {
      accessToken: 'a',
      refreshToken: 'r',
      expiresIn: 60,
    });
    expect(cookies[0]?.[2].maxAge).toBe(60_000);
  });

  it('clears all three cookies with matching path and domain', () => {
    const { response, cleared } = fakeResponse();
    clearSessionCookies(response, config);
    expect(cleared.map(([n]) => n)).toEqual([
      '__Secure-rt_access',
      '__Secure-rt_refresh',
      '__Secure-rt_csrf',
    ]);
    expect(cleared[1]?.[1]).toMatchObject({
      path: '/api/v1/auth',
      domain: 'tripz.vn',
    });
  });

  it('parses cookie headers and ignores malformed entries', () => {
    expect(readCookies('a=1; b=%E0%A4%A; c=x%20y')).toEqual({
      a: '1',
      c: 'x y',
    });
    expect(readCookies(undefined)).toEqual({});
  });
});
