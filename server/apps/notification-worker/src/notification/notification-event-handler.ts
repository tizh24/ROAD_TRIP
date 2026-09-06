import { Injectable } from '@nestjs/common';
import {
  tripCreatedV1Schema,
  tripInvitationCreatedV1Schema,
} from '@roadtrip/contracts';
import type { QueryExecutor } from '@roadtrip/db-client';
import { UnrecoverableError } from 'bullmq';

export interface NotificationDatabase extends QueryExecutor {
  transaction<Result>(
    work: (transaction: QueryExecutor) => Promise<Result>,
  ): Promise<Result>;
}

@Injectable()
export class NotificationEventHandler {
  constructor(private readonly database: NotificationDatabase) {}

  async handle(event: unknown): Promise<void> {
    const parsed = parseEvent(event);
    await this.database.transaction(async (transaction) => {
      const claimed = await transaction.query<{ eventId: string }>(
        `INSERT INTO notification_schema.processed_events (event_id, event_type, event_version)
         VALUES ($1, $2, $3) ON CONFLICT (event_id) DO NOTHING RETURNING event_id AS "eventId"`,
        [parsed.eventId, parsed.eventType, parsed.eventVersion],
      );
      if (!claimed.rows[0]) return;
      const delivery =
        parsed.eventType === 'trip.created.v1'
          ? { channel: 'PUSH', recipient: parsed.payload.ownerId }
          : { channel: 'EMAIL', recipient: parsed.payload.inviteeEmail };
      await transaction.query(
        `INSERT INTO notification_schema.notification_deliveries (event_id, channel, recipient)
         VALUES ($1, $2, $3) ON CONFLICT (event_id, channel, recipient) DO NOTHING`,
        [parsed.eventId, delivery.channel, delivery.recipient],
      );
    });
  }
}

function parseEvent(event: unknown) {
  const created = tripCreatedV1Schema.safeParse(event);
  if (created.success) return created.data;
  const invitation = tripInvitationCreatedV1Schema.safeParse(event);
  if (invitation.success) return invitation.data;
  throw new UnrecoverableError('Invalid integration event payload.');
}
