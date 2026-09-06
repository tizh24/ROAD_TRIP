import { z } from 'zod';
import { cursorPaginationMetaSchema } from './pagination';
import { responseMetaSchema, successResponseSchema } from './response';

export const coordinateSchema = z
  .object({
    latitude: z.number().finite().min(-90).max(90),
    longitude: z.number().finite().min(-180).max(180),
  })
  .strict();

export const vehicleModeSchema = z.enum(['car', 'motorcycle']);

export const placeSearchQuerySchema = z
  .object({
    q: z.string().trim().min(1).max(200),
    cursor: z.string().min(1).max(512).optional(),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  })
  .strict();

export const placeSchema = z
  .object({
    id: z.string().min(1).max(256),
    name: z.string().trim().min(1).max(500),
    address: z.string().trim().min(1).max(1_000),
    coordinate: coordinateSchema,
  })
  .strict();

export const placeSearchResponseSchema = z
  .object({
    data: z.array(placeSchema),
    meta: responseMetaSchema.extend({ pagination: cursorPaginationMetaSchema }),
  })
  .strict();

export const routePreviewRequestSchema = z
  .object({
    coordinates: z.array(coordinateSchema).min(2).max(25),
    vehicle: vehicleModeSchema.default('car'),
  })
  .strict();

export const routeGeometrySchema = z
  .object({
    type: z.literal('LineString'),
    coordinates: z.array(z.tuple([z.number(), z.number()])).min(2),
  })
  .strict();

export const routePreviewSchema = z
  .object({
    geometry: routeGeometrySchema,
    distanceMeters: z.number().finite().nonnegative(),
    durationSeconds: z.number().finite().nonnegative(),
    source: z.enum(['provider', 'cache']),
    calculatedAt: z.iso.datetime({ offset: true }),
  })
  .strict();

export const routePreviewResponseSchema =
  successResponseSchema(routePreviewSchema);

export type Coordinate = z.infer<typeof coordinateSchema>;
export type VehicleMode = z.infer<typeof vehicleModeSchema>;
export type PlaceSearchQuery = z.infer<typeof placeSearchQuerySchema>;
export type Place = z.infer<typeof placeSchema>;
export type RoutePreviewRequest = z.infer<typeof routePreviewRequestSchema>;
export type RoutePreview = z.infer<typeof routePreviewSchema>;
