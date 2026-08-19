export function setGatewayTestEnv(
  overrides: Readonly<Record<string, string>> = {},
) {
  Object.assign(process.env, {
    NODE_ENV: 'test',
    LOG_LEVEL: 'error',
    SUPABASE_URL: 'http://127.0.0.1:54321',
    SUPABASE_JWKS_URL: 'http://127.0.0.1:1/jwks',
    SUPABASE_JWT_ISSUER: 'https://issuer.test/auth/v1',
    SUPABASE_JWT_AUDIENCE: 'authenticated',
    REDIS_URL: 'redis://127.0.0.1:6379',
    CORE_TRIP_SERVICE_URL: 'http://127.0.0.1:4101',
    GEO_LOCATION_SERVICE_URL: 'http://127.0.0.1:4102',
    INTERNAL_SERVICE_TOKEN: 'test-internal-token-at-least-32-characters',
    CORS_ALLOWED_ORIGINS: 'http://localhost:3000',
    REQUEST_BODY_LIMIT_BYTES: '1048576',
    RATE_LIMIT_WINDOW_MS: '60000',
    RATE_LIMIT_MAX: '100',
    RATE_LIMIT_AUTHENTICATED_MAX: '300',
    ...overrides,
  });
}
