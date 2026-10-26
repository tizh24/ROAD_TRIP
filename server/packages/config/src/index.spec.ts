import { ConfigurationError, gatewayConfigSchema, parseConfig } from './index';

const validGatewayEnv = {
  SUPABASE_URL: 'http://127.0.0.1:54321',
  SUPABASE_JWKS_URL: 'http://127.0.0.1:54321/auth/v1/.well-known/jwks.json',
  SUPABASE_JWT_ISSUER: 'http://127.0.0.1:54321/auth/v1',
  SUPABASE_PUBLISHABLE_KEY: 'test-publishable-key',
  SUPABASE_SERVICE_ROLE_KEY: 'test-server-only-service-role-key',
  REDIS_URL: 'redis://127.0.0.1:6379',
  CORE_TRIP_SERVICE_URL: 'http://core-trip-service:4101',
  GEO_LOCATION_SERVICE_URL: 'http://geo-location-service:4102',
  INTERNAL_SERVICE_TOKEN: 'local-only-token-at-least-32-chars',
  CORS_ALLOWED_ORIGINS: 'http://localhost:3000',
};

describe('runtime configuration', () => {
  it('applies safe defaults and coerces numeric values', () => {
    const config = parseConfig(gatewayConfigSchema, {
      ...validGatewayEnv,
      PORT: '4200',
    });

    expect(config.PORT).toBe(4200);
    expect(config.NODE_ENV).toBe('development');
    expect(config.RATE_LIMIT_MAX).toBe(100);
    expect(config.RATE_LIMIT_AUTHENTICATED_MAX).toBe(300);
    expect(config.REQUEST_BODY_LIMIT_BYTES).toBe(1_048_576);
    expect(config.REDIS_RATE_LIMIT_PREFIX).toBe('roadtrip:rate-limit');
  });

  it('fails fast without exposing secret values', () => {
    const secret = 'too-short-secret';

    expect(() =>
      parseConfig(gatewayConfigSchema, {
        ...validGatewayEnv,
        INTERNAL_SERVICE_TOKEN: secret,
        SUPABASE_URL: 'not-a-url',
      }),
    ).toThrow(ConfigurationError);

    try {
      parseConfig(gatewayConfigSchema, {
        ...validGatewayEnv,
        INTERNAL_SERVICE_TOKEN: secret,
        SUPABASE_URL: 'not-a-url',
      });
    } catch (error) {
      expect(String(error)).toContain('INTERNAL_SERVICE_TOKEN');
      expect(String(error)).toContain('SUPABASE_URL');
      expect(String(error)).not.toContain(secret);
      expect(String(error)).not.toContain('not-a-url');
    }
  });

  it('rejects wildcard CORS origins and unsafe body limits', () => {
    expect(() =>
      parseConfig(gatewayConfigSchema, {
        ...validGatewayEnv,
        CORS_ALLOWED_ORIGINS: '*',
        REQUEST_BODY_LIMIT_BYTES: '10485761',
      }),
    ).toThrow(ConfigurationError);
  });

  describe('gateway session settings', () => {
    const invalid = (extra: Record<string, string>) =>
      expect(() =>
        parseConfig(gatewayConfigSchema, { ...validGatewayEnv, ...extra }),
      ).toThrow(ConfigurationError);

    it('defaults to secure prefixed cookies', () => {
      const config = parseConfig(gatewayConfigSchema, validGatewayEnv);
      expect(config.AUTH_COOKIE_SECURE).toBe(true);
      expect(config.AUTH_ACCESS_COOKIE_NAME).toBe('__Secure-rt_access');
      expect(config.AUTH_ACCESS_COOKIE_MAX_AGE_SECONDS).toBe(900);
    });

    it('rejects prefixed cookie names without Secure cookies', () => {
      invalid({ AUTH_COOKIE_SECURE: 'false' });
    });

    it('rejects duplicate names, malformed domains and foreign web origins', () => {
      const plain = {
        AUTH_COOKIE_SECURE: 'false',
        AUTH_ACCESS_COOKIE_NAME: 'rt_a',
        AUTH_REFRESH_COOKIE_NAME: 'rt_a',
        CSRF_COOKIE_NAME: 'rt_c',
      };
      invalid(plain);
      invalid({ AUTH_COOKIE_DOMAIN: 'https://tripz.vn' });
      invalid({ PUBLIC_WEB_ORIGIN: 'https://other.example' });
    });

    it('accepts a listed public web origin and a bare cookie domain', () => {
      expect(
        parseConfig(gatewayConfigSchema, {
          ...validGatewayEnv,
          PUBLIC_WEB_ORIGIN: 'http://localhost:3000',
          AUTH_COOKIE_DOMAIN: 'tripz.vn',
        }).PUBLIC_WEB_ORIGIN,
      ).toBe('http://localhost:3000');
    });
  });
});
