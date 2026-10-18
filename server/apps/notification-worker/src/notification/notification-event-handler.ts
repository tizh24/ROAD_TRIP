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

export interface DeliverySender {
  send(delivery: {
    channel: 'EMAIL' | 'PUSH';
    recipient: string;
    eventType: string;
    payload: unknown;
  }): Promise<void>;
}

@Injectable()
export class NotificationEventHandler {
  constructor(
    private readonly database: NotificationDatabase,
    private readonly sender: DeliverySender = { send: async () => {} },
  ) {}

  async handle(event: unknown): Promise<void> {
    const parsed = parseEvent(event);
    await this.database.transaction(async (transaction) => {
      const claimed = await transaction.query<{ eventId: string }>(
        `INSERT INTO notification_schema.processed_events (event_id, event_type, event_version)
         VALUES ($1, $2, $3) ON CONFLICT (event_id) DO NOTHING RETURNING event_id AS "eventId"`,
        [parsed.eventId, parsed.eventType, parsed.eventVersion],
      );
      if (!claimed.rows[0]) return;

      if (parsed.eventType === 'trip.invitation.created.v1') {
        const invRow = await transaction.query<{ status: string }>(
          `SELECT status FROM trip_schema.trip_invitations WHERE id = $1`,
          [parsed.payload.invitationId],
        );
        if (invRow.rows[0]?.status === 'REVOKED') {
          await transaction.query(
            `INSERT INTO notification_schema.notification_deliveries (event_id, channel, recipient, delivery_status, attempts)
             VALUES ($1, 'EMAIL', $2, 'SKIPPED', 0)
             ON CONFLICT (event_id, channel, recipient) DO UPDATE
               SET delivery_status = 'SKIPPED'`,
            [parsed.eventId, parsed.payload.inviteeEmail],
          );
          return;
        }
      }

      const channel = parsed.eventType === 'trip.created.v1' ? 'PUSH' : 'EMAIL';
      const recipient =
        parsed.eventType === 'trip.created.v1'
          ? parsed.payload.ownerId
          : parsed.payload.inviteeEmail;

      try {
        await this.sender.send({
          channel,
          recipient,
          eventType: parsed.eventType,
          payload: parsed.payload,
        });

        await transaction.query(
          `INSERT INTO notification_schema.notification_deliveries (event_id, channel, recipient, delivery_status, attempts, delivered_at)
           VALUES ($1, $2, $3, 'SENT', 1, now())
           ON CONFLICT (event_id, channel, recipient) DO UPDATE
             SET delivery_status = 'SENT',
                 attempts = notification_schema.notification_deliveries.attempts + 1,
                 delivered_at = now(),
                 last_error = NULL,
                 last_error_code = NULL`,
          [parsed.eventId, channel, recipient],
        );
      } catch (deliveryError) {
        const err = deliveryError as Error & { code?: string };
        await transaction.query(
          `INSERT INTO notification_schema.notification_deliveries (event_id, channel, recipient, delivery_status, attempts, next_attempt_at, last_error_code, last_error)
           VALUES ($1, $2, $3, 'FAILED', 1, now() + interval '1 minute', $4, $5)
           ON CONFLICT (event_id, channel, recipient) DO UPDATE
             SET delivery_status = 'FAILED',
                 attempts = notification_schema.notification_deliveries.attempts + 1,
                 next_attempt_at = now() + (interval '1 minute' * (notification_schema.notification_deliveries.attempts + 1)),
                 last_error_code = $4,
                 last_error = $5,
                 delivered_at = NULL`,
          [
            parsed.eventId,
            channel,
            recipient,
            err.code || 'DELIVERY_FAILED',
            err.message || 'Delivery failed',
          ],
        );
      }
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
