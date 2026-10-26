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

  /**
   * The delivery row is the idempotency record: a duplicate or replayed event is
   * ignored once it is SENT or SKIPPED, while a FAILED delivery is retried. A
   * failure is committed (attempt count, next attempt, redacted error) and then
   * rethrown so BullMQ applies its bounded exponential backoff.
   */
  async handle(event: unknown): Promise<void> {
    const parsed = parseEvent(event);
    const channel = parsed.eventType === 'trip.created.v1' ? 'PUSH' : 'EMAIL';
    const recipient =
      parsed.eventType === 'trip.created.v1'
        ? parsed.payload.ownerId
        : parsed.payload.inviteeEmail;
    let failure: Error | undefined;

    await this.database.transaction(async (transaction) => {
      await transaction.query(
        `INSERT INTO notification_schema.processed_events (event_id, event_type, event_version)
         VALUES ($1, $2, $3) ON CONFLICT (event_id) DO NOTHING`,
        [parsed.eventId, parsed.eventType, parsed.eventVersion],
      );
      await transaction.query(
        `INSERT INTO notification_schema.notification_deliveries (event_id, channel, recipient, delivery_status, attempts)
         VALUES ($1, $2, $3, 'PENDING', 0)
         ON CONFLICT (event_id, channel, recipient) DO NOTHING`,
        [parsed.eventId, channel, recipient],
      );
      const current = await transaction.query<{ deliveryStatus: string }>(
        `SELECT delivery_status AS "deliveryStatus"
           FROM notification_schema.notification_deliveries
          WHERE event_id = $1 AND channel = $2 AND recipient = $3
          FOR UPDATE`,
        [parsed.eventId, channel, recipient],
      );
      const status = current.rows[0]?.deliveryStatus;
      if (status === 'SENT' || status === 'SKIPPED') return;

      if (parsed.eventType === 'trip.invitation.created.v1') {
        const invitation = await transaction.query<{ status: string }>(
          `SELECT status FROM trip_schema.trip_invitations WHERE id = $1`,
          [parsed.payload.invitationId],
        );
        if (invitation.rows[0]?.status === 'REVOKED') {
          await transaction.query(
            `UPDATE notification_schema.notification_deliveries
                SET delivery_status = 'SKIPPED'
              WHERE event_id = $1 AND channel = $2 AND recipient = $3`,
            [parsed.eventId, channel, recipient],
          );
          return;
        }
      }

      try {
        await this.sender.send({
          channel,
          recipient,
          eventType: parsed.eventType,
          payload: parsed.payload,
        });
        await transaction.query(
          `UPDATE notification_schema.notification_deliveries
              SET delivery_status = 'SENT', attempts = attempts + 1,
                  delivered_at = now(), last_error = NULL, last_error_code = NULL
            WHERE event_id = $1 AND channel = $2 AND recipient = $3`,
          [parsed.eventId, channel, recipient],
        );
      } catch (deliveryError) {
        const err = deliveryError as Error & { code?: string };
        failure = err;
        await transaction.query(
          `UPDATE notification_schema.notification_deliveries
              SET delivery_status = 'FAILED', attempts = attempts + 1,
                  next_attempt_at = now() + (interval '1 minute' * (attempts + 1)),
                  last_error_code = $4, last_error = $5, delivered_at = NULL
            WHERE event_id = $1 AND channel = $2 AND recipient = $3`,
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

    if (failure) throw failure;
  }
}

function parseEvent(event: unknown) {
  const created = tripCreatedV1Schema.safeParse(event);
  if (created.success) return created.data;
  const invitation = tripInvitationCreatedV1Schema.safeParse(event);
  if (invitation.success) return invitation.data;
  throw new UnrecoverableError('Invalid integration event payload.');
}
