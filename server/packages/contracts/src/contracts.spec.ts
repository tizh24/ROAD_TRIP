import {
  cursorPaginationQuerySchema,
  errorResponseSchema,
  paginatedResponseSchema,
  successResponseSchema,
  tripCreatedV1Schema,
  tripInvitationCreatedV1Schema,
} from './index';

const eventBase = {
  eventId: '5cc2e440-0f2d-4ca9-9e0a-e030e1226a52',
  eventVersion: 1,
  occurredAt: '2026-08-14T08:30:00.000Z',
  correlationId: 'request-123',
  producer: 'core-trip-service',
  aggregateId: '13fbcd49-21d9-4f7e-9424-6870603ec2bc',
} as const;

describe('HTTP contracts', () => {
  it('validates success, error and paginated envelopes', () => {
    expect(
      successResponseSchema(
        cursorPaginationQuerySchema.pick({ limit: true }),
      ).safeParse({
        data: { limit: 20 },
        meta: { correlationId: 'request-123' },
      }).success,
    ).toBe(true);

    expect(
      errorResponseSchema.safeParse({
        error: { code: 'NOT_A_STABLE_CODE', message: '' },
        meta: { correlationId: '' },
      }).success,
    ).toBe(false);

    expect(cursorPaginationQuerySchema.parse({ limit: '100' }).limit).toBe(100);
    expect(cursorPaginationQuerySchema.safeParse({ limit: 101 }).success).toBe(
      false,
    );
  });

  it('validates paginated item payloads', () => {
    const schema = paginatedResponseSchema(cursorPaginationQuerySchema);
    expect(
      schema.safeParse({
        data: [{ limit: 10 }],
        meta: {
          correlationId: 'request-123',
          pagination: { nextCursor: null, hasMore: false },
        },
      }).success,
    ).toBe(true);
    expect(
      schema.safeParse({
        data: [{ limit: 10, databaseInternalId: 42 }],
        meta: {
          correlationId: 'request-123',
          pagination: { nextCursor: null, hasMore: false },
        },
      }).success,
    ).toBe(false);
  });
});

describe('event contracts', () => {
  it('accepts TripCreatedV1 and rejects invalid dates or day counts', () => {
    expect(
      tripCreatedV1Schema.safeParse({
        ...eventBase,
        eventType: 'trip.created.v1',
        payload: {
          tripId: eventBase.aggregateId,
          ownerId: 'b6f35725-45ea-4487-9a49-d22fd7627d95',
          title: 'Da Lat weekend',
          startDate: '2026-09-01',
          endDate: '2026-09-03',
          dayCount: 3,
        },
      }).success,
    ).toBe(true);
    expect(
      tripCreatedV1Schema.safeParse({
        ...eventBase,
        eventType: 'trip.created.v1',
        payload: { dayCount: 31 },
      }).success,
    ).toBe(false);
  });

  it('accepts TripInvitationCreatedV1 and rejects raw invalid payloads', () => {
    expect(
      tripInvitationCreatedV1Schema.safeParse({
        ...eventBase,
        eventType: 'trip.invitation.created.v1',
        payload: {
          invitationId: '07f99abe-b280-4331-8027-864a4abbe572',
          tripId: eventBase.aggregateId,
          inviterId: 'b6f35725-45ea-4487-9a49-d22fd7627d95',
          inviteeEmail: 'friend@example.com',
          permission: 'EDIT',
          expiresAt: '2026-08-21T08:30:00.000Z',
        },
      }).success,
    ).toBe(true);
    expect(
      tripInvitationCreatedV1Schema.safeParse({
        ...eventBase,
        eventType: 'trip.invitation.created.v1',
        payload: { inviteeEmail: 'not-an-email', permission: 'OWNER' },
      }).success,
    ).toBe(false);
  });
});
