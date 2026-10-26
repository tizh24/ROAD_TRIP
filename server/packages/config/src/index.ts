import { z } from 'zod';

const environment = z.enum(['development', 'test', 'production']);
const logLevel = z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']);
const url = z.url();
const positiveInteger = z.coerce.number().int().positive();
const nonNegativeInteger = z.coerce.number().int().nonnegative();
const requestBodyLimit = positiveInteger.max(10_485_760);
const boolean = z
  .enum(['true', 'false'])
  .transform((value) => value === 'true');
const corsAllowedOrigins = z
  .string()
  .min(1)
  .refine((value) =>
    value.split(',').every((entry) => {
      const candidate = entry.trim();
      if (!candidate || candidate === '*') return false;
      try {
        const parsed = new URL(candidate);
        return (
          (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
          parsed.username === '' &&
          parsed.password === '' &&
          parsed.pathname === '/' &&
          parsed.search === '' &&
          parsed.hash === ''
        );
      } catch {
        return false;
      }
    }),
  );

const commonShape = {
  NODE_ENV: environment.default('development'),
  LOG_LEVEL: logLevel.default('info'),
};

const authShape = {
  SUPABASE_URL: url,
  SUPABASE_JWKS_URL: url,
  SUPABASE_JWT_ISSUER: url,
  SUPABASE_JWT_AUDIENCE: z.string().min(1).default('authenticated'),
  // Required only by Supabase projects that still issue legacy HS256 access tokens.
  // Keep it server-only; modern asymmetric signing uses the JWKS endpoint instead.
  SUPABASE_JWT_SECRET: z.string().min(32).optional(),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
};

const redisShape = {
  REDIS_URL: url,
};

const redisCacheShape = {
  REDIS_CACHE_PREFIX: z.string().min(1).default('roadtrip:cache'),
};

const redisRateLimitShape = {
  REDIS_RATE_LIMIT_PREFIX: z.string().min(1).default('roadtrip:rate-limit'),
};

const bullMqShape = {
  BULLMQ_QUEUE_NAME: z.string().min(1).default('integration-events'),
  BULLMQ_QUEUE_PREFIX: z.string().min(1).default('roadtrip:bullmq'),
  BULLMQ_CONCURRENCY: positiveInteger.default(5),
  BULLMQ_ATTEMPTS: positiveInteger.default(5),
  BULLMQ_BACKOFF_MS: positiveInteger.default(1000),
  BULLMQ_FAILED_RETENTION: nonNegativeInteger.default(1000),
};

const gatewayConfigBase = z.object({
  ...commonShape,
  ...authShape,
  ...redisShape,
  ...redisRateLimitShape,
  PORT: positiveInteger.default(4100),
  CORE_TRIP_SERVICE_URL: url,
  GEO_LOCATION_SERVICE_URL: url,
  INTERNAL_SERVICE_TOKEN: z.string().min(32),
  CORS_ALLOWED_ORIGINS: corsAllowedOrigins,
  REQUEST_BODY_LIMIT_BYTES: requestBodyLimit.default(1_048_576),
  UPSTREAM_TIMEOUT_MS: positiveInteger.max(30_000).default(5_000),
  RATE_LIMIT_WINDOW_MS: positiveInteger.default(60_000),
  RATE_LIMIT_MAX: positiveInteger.default(100),
  RATE_LIMIT_AUTHENTICATED_MAX: positiveInteger.default(300),
  // Canonical browser origin used for auth e-mail return links. Defaults to the
  // first CORS origin and must be one of them.
  PUBLIC_WEB_ORIGIN: z.url().optional(),
  AUTH_COOKIE_DOMAIN: z
    .string()
    .regex(/^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$/i, 'bare host name')
    .optional(),
  AUTH_COOKIE_SECURE: boolean.default(true),
  AUTH_ACCESS_COOKIE_NAME: z.string().min(1).default('__Secure-rt_access'),
  AUTH_REFRESH_COOKIE_NAME: z.string().min(1).default('__Secure-rt_refresh'),
  CSRF_COOKIE_NAME: z.string().min(1).default('__Secure-rt_csrf'),
  AUTH_ACCESS_COOKIE_MAX_AGE_SECONDS: positiveInteger.default(900),
  AUTH_REFRESH_COOKIE_MAX_AGE_SECONDS: positiveInteger.default(2_592_000),
  // HMAC secret used only by the public payment-provider webhook endpoint.
  // Leaving it unset disables that endpoint rather than accepting unsigned data.
  PAYMENT_WEBHOOK_SECRET: z.string().min(32).optional(),
});

export const gatewayConfigSchema = gatewayConfigBase.superRefine(
  (config, context) => {
    const issue = (path: string, message: string) =>
      context.addIssue({ code: 'custom', path: [path], message });
    const names = [
      ['AUTH_ACCESS_COOKIE_NAME', config.AUTH_ACCESS_COOKIE_NAME],
      ['AUTH_REFRESH_COOKIE_NAME', config.AUTH_REFRESH_COOKIE_NAME],
      ['CSRF_COOKIE_NAME', config.CSRF_COOKIE_NAME],
    ] as const;
    if (new Set(names.map(([, name]) => name)).size !== names.length) {
      issue('CSRF_COOKIE_NAME', 'cookie names must be distinct');
    }
    for (const [key, name] of names) {
      if (/^__(Secure|Host)-/.test(name) && !config.AUTH_COOKIE_SECURE) {
        issue(key, 'prefixed cookie names require AUTH_COOKIE_SECURE=true');
      }
    }
    const origins = config.CORS_ALLOWED_ORIGINS.split(',').map((value) =>
      value.trim(),
    );
    if (
      config.PUBLIC_WEB_ORIGIN &&
      !origins.includes(new URL(config.PUBLIC_WEB_ORIGIN).origin)
    ) {
      issue('PUBLIC_WEB_ORIGIN', 'must be listed in CORS_ALLOWED_ORIGINS');
    }
  },
);

export const coreTripConfigSchema = z.object({
  ...commonShape,
  ...authShape,
  ...redisShape,
  ...bullMqShape,
  PORT: positiveInteger.default(4101),
  DATABASE_URL: url,
  INTERNAL_SERVICE_TOKEN: z.string().min(32),
});

export const geoLocationConfigSchema = z.object({
  ...commonShape,
  ...authShape,
  ...redisShape,
  ...redisCacheShape,
  PORT: positiveInteger.default(4102),
  INTERNAL_SERVICE_TOKEN: z.string().min(32),
  GEO_SEARCH_CACHE_TTL_SECONDS: positiveInteger.default(300),
  GEO_ROUTE_CACHE_TTL_SECONDS: positiveInteger.default(120),
  LOCATIONIQ_BASE_URL: url.default('https://us1.locationiq.com'),
  LOCATIONIQ_API_KEY: z.string().min(1),
  LOCATIONIQ_TIMEOUT_MS: positiveInteger.default(5000),
});

export const notificationWorkerConfigSchema = z.object({
  ...commonShape,
  ...redisShape,
  ...bullMqShape,
  PORT: positiveInteger.default(4105),
  DATABASE_URL: url,
});

export type GatewayConfig = z.infer<typeof gatewayConfigSchema>;
export type CoreTripConfig = z.infer<typeof coreTripConfigSchema>;
export type GeoLocationConfig = z.infer<typeof geoLocationConfigSchema>;
export type NotificationWorkerConfig = z.infer<
  typeof notificationWorkerConfigSchema
>;

export class ConfigurationError extends Error {
  constructor(readonly invalidVariables: readonly string[]) {
    super(`Invalid runtime configuration: ${invalidVariables.join(', ')}`);
    this.name = 'ConfigurationError';
  }
}

export function parseConfig<T>(
  schema: z.ZodType<T>,
  env: NodeJS.ProcessEnv,
): T {
  const result = schema.safeParse(env);
  if (result.success) return result.data;

  const invalidVariables = [
    ...new Set(
      result.error.issues.map((issue) => String(issue.path[0] ?? 'ENV')),
    ),
  ].sort();
  throw new ConfigurationError(invalidVariables);
}

export const loadGatewayConfig = (env: NodeJS.ProcessEnv = process.env) =>
  parseConfig(gatewayConfigSchema, env);
export const loadCoreTripConfig = (env: NodeJS.ProcessEnv = process.env) =>
  parseConfig(coreTripConfigSchema, env);
export const loadGeoLocationConfig = (env: NodeJS.ProcessEnv = process.env) =>
  parseConfig(geoLocationConfigSchema, env);
export const loadNotificationWorkerConfig = (
  env: NodeJS.ProcessEnv = process.env,
) => parseConfig(notificationWorkerConfigSchema, env);
