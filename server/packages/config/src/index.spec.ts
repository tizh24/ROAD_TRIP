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
});
