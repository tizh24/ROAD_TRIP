import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';
import type { TransactionalDatabase } from '../database/trip.repository';
import {
  EVENT_PUBLISHER,
  type EventPublisher,
  type IntegrationEvent,
} from '../../application/events/event-publisher.port';
import { OutboxMetrics } from '../observability/outbox-metrics';

interface OutboxRow {
  readonly id: string;
  readonly aggregateId: string;
  readonly eventType: string;
  readonly eventVersion: number;
  readonly payload: unknown;
  readonly correlationId: string;
  readonly occurredAt: Date | string;
}

@Injectable()
export class OutboxPublisher
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger(OutboxPublisher.name);
  private timer: NodeJS.Timeout | undefined;
  private publishing = false;

  constructor(
    private readonly database: TransactionalDatabase,
    @Inject(EVENT_PUBLISHER) private readonly publisher: EventPublisher,
    private readonly metrics: OutboxMetrics,
  ) {}

  onApplicationBootstrap(): void {
    this.timer = setInterval(() => void this.publishPending(), 1_000);
    this.timer.unref();
    void this.publishPending();
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  async publishPending(batchSize = 25): Promise<number> {
    if (this.publishing) return 0;
    this.publishing = true;
    try {
      const events = await this.claim(batchSize);
      for (const event of events) {
        this.metrics.observeLag(event.occurredAt);
        try {
          await this.publisher.publish(toIntegrationEvent(event));
          await this.markPublished(event.id);
          this.metrics.recordPublished();
        } catch (error) {
          await this.markFailed(event.id);
          this.metrics.recordFailed();
          this.logger.warn(
            { eventId: event.id },
            'Outbox event publication failed',
          );
        }
      }
      return events.length;
    } finally {
      this.publishing = false;
    }
  }

  private claim(batchSize: number): Promise<readonly OutboxRow[]> {
    return this.database.transaction(async (transaction) => {
      const result = await transaction.query<OutboxRow>(
        `WITH candidates AS (
           SELECT id
             FROM trip_schema.outbox_events
            WHERE publish_status IN ('PENDING', 'FAILED')
              AND next_attempt_at <= now()
            ORDER BY occurred_at, id
            LIMIT $1
            FOR UPDATE SKIP LOCKED
         )
         UPDATE trip_schema.outbox_events event
            SET publish_status = 'PENDING',
                next_attempt_at = now() + interval '5 minutes'
           FROM candidates
          WHERE event.id = candidates.id
         RETURNING event.id, event.aggregate_id AS "aggregateId",
                   event.event_type AS "eventType", event.event_version AS "eventVersion",
                   event.payload, event.correlation_id AS "correlationId",
                   event.occurred_at AS "occurredAt"`,
        [batchSize],
      );
      return result.rows;
    });
  }

  private async markPublished(id: string): Promise<void> {
    await this.database.query(
      `UPDATE trip_schema.outbox_events
          SET publish_status = 'PUBLISHED', published_at = now(), last_error = NULL
        WHERE id = $1 AND publish_status = 'PENDING'`,
      [id],
    );
  }

  private async markFailed(id: string): Promise<void> {
    await this.database.query(
      `UPDATE trip_schema.outbox_events
          SET publish_status = 'FAILED', attempts = attempts + 1,
              next_attempt_at = now() + make_interval(secs => LEAST(300, power(2, attempts + 1)::integer)),
              last_error = 'publish_failed'
        WHERE id = $1 AND publish_status = 'PENDING'`,
      [id],
    );
  }
}

function toIntegrationEvent(row: OutboxRow): IntegrationEvent {
  return {
    eventId: row.id,
    eventType: row.eventType,
    eventVersion: row.eventVersion,
    occurredAt:
      typeof row.occurredAt === 'string'
        ? new Date(row.occurredAt).toISOString()
        : row.occurredAt.toISOString(),
    correlationId: row.correlationId,
    producer: 'core-trip-service',
    aggregateId: row.aggregateId,
    payload: row.payload,
  };
}
