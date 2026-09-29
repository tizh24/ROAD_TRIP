import { z } from 'zod';
import { integrationEventSchema } from './envelope';

export const tripInvitationCreatedV1PayloadSchema = z
  .object({
    invitationId: z.uuid(),
    tripId: z.uuid(),
    inviterId: z.uuid(),
    inviteeEmail: z.email(),
    permission: z.enum(['VIEW', 'EDIT']),
    expiresAt: z.iso.datetime({ offset: true }),
  })
  .strict();

export const tripInvitationCreatedV1Schema = integrationEventSchema(
  'trip.invitation.created.v1',
  tripInvitationCreatedV1PayloadSchema,
);

export type TripInvitationCreatedV1 = z.infer<
  typeof tripInvitationCreatedV1Schema
>;
