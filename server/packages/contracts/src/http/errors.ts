import { z } from 'zod';

export const errorCodeSchema = z.enum([
  'AUTH_REQUIRED',
  'AUTH_INVALID',
  'AUTH_UNAVAILABLE',
  'ACCOUNT_INACTIVE',
  'FORBIDDEN',
  'TRIP_NOT_FOUND',
  'TRIP_DATE_RANGE_INVALID',
  'TRIP_DATE_RANGE_TOO_LONG',
  'TRIP_VERSION_CONFLICT',
  'TRIP_INCOMPLETE_FOR_PUBLICATION',
  'DAY_NOT_FOUND',
  'STOP_NOT_FOUND',
  'STOP_ORDER_INVALID',
  'INVITATION_INVALID',
  'INVITATION_EXPIRED',
  'PLACE_PROVIDER_UNAVAILABLE',
  'ROUTE_UNAVAILABLE',
  'VALIDATION_FAILED',
  'RATE_LIMITED',
  'INTERNAL_ERROR',
]);

export const errorDetailsSchema = z.record(z.string(), z.unknown());

export const apiErrorSchema = z
  .object({
    code: errorCodeSchema,
    message: z.string().min(1),
    details: errorDetailsSchema.optional(),
  })
  .strict();

export type ErrorCode = z.infer<typeof errorCodeSchema>;
export type ApiError = z.infer<typeof apiErrorSchema>;
