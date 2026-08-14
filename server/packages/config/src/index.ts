import { z } from 'zod';

const environment = z.enum(['development', 'test', 'production']);
const logLevel = z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']);
const url = z.url();
const positiveInteger = z.coerce.number().int().positive();
const nonNegativeInteger = z.coerce.number().int().nonnegative();

const commonShape = {
  NODE_ENV: environment.default('development'),
  LOG_LEVEL: logLevel.default('info'),
};

const authShape = {
  SUPABASE_URL: url,
  SUPABASE_JWKS_URL: url,
  SUPABASE_JWT_ISSUER: url,
  SUPABASE_JWT_AUDIENCE: z.string().min(1).default('authenticated'),
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

export const gatewayConfigSchema = z.object({
  ...commonShape,
  ...authShape,
  ...redisShape,
  ...redisRateLimitShape,
  PORT: positiveInteger.default(4100),
  CORE_TRIP_SERVICE_URL: url,
  GEO_LOCATION_SERVICE_URL: url,
  INTERNAL_SERVICE_TOKEN: z.string().min(32),
  CORS_ALLOWED_ORIGINS: z.string().min(1),
  RATE_LIMIT_WINDOW_MS: positiveInteger.default(60_000),
  RATE_LIMIT_MAX: positiveInteger.default(100),
});

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
  GEO_CACHE_TTL_SECONDS: positiveInteger.default(300),
  VIETMAP_BASE_URL: url,
  VIETMAP_API_KEY: z.string().min(1),
  VIETMAP_TIMEOUT_MS: positiveInteger.default(5000),
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
