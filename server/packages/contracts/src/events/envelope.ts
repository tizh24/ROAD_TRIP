import { z } from 'zod';

export const integrationEventBaseSchema = z
  .object({
    eventId: z.uuid(),
    eventVersion: z.literal(1),
    occurredAt: z.iso.datetime({ offset: true }),
    correlationId: z.string().min(1).max(128),
    producer: z.enum(['core-trip-service']),
    aggregateId: z.uuid(),
  })
  .strict();

export function integrationEventSchema<
  TType extends string,
  TPayload extends z.ZodType,
>(eventType: TType, payload: TPayload) {
  return integrationEventBaseSchema
    .extend({
      eventType: z.literal(eventType),
      payload,
    })
    .strict();
}

export type IntegrationEventBase = z.infer<typeof integrationEventBaseSchema>;
