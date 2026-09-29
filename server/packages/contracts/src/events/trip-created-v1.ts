import { z } from 'zod';
import { integrationEventSchema } from './envelope';

export const tripCreatedV1PayloadSchema = z
  .object({
    tripId: z.uuid(),
    ownerId: z.uuid(),
    title: z.string().trim().min(1).max(120),
    startDate: z.iso.date(),
    endDate: z.iso.date(),
    dayCount: z.number().int().min(1).max(30),
  })
  .strict();

export const tripCreatedV1Schema = integrationEventSchema(
  'trip.created.v1',
  tripCreatedV1PayloadSchema,
);

export type TripCreatedV1 = z.infer<typeof tripCreatedV1Schema>;
