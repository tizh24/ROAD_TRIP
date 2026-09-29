import { ConfigurationError, gatewayConfigSchema, parseConfig } from './index';

const validGatewayEnv = {
  SUPABASE_URL: 'http://127.0.0.1:54321',
  SUPABASE_JWKS_URL: 'http://127.0.0.1:54321/auth/v1/.well-known/jwks.json',
  SUPABASE_JWT_ISSUER: 'http://127.0.0.1:54321/auth/v1',
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
});
