import type { QueryExecutor, TransactionWork } from '@roadtrip/db-client';
import type { Trip } from '../../domain/trip';
import { Version } from '../../domain/value-objects';

export interface TransactionalDatabase extends QueryExecutor {
  transaction<Result>(work: TransactionWork<Result>): Promise<Result>;
}

export interface TripListRow {
  readonly id: string;
  readonly title: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly status: string;
  readonly role: string;
  readonly permission: string;
  readonly version: number;
}

export interface TripDetailRow extends TripListRow {
  readonly ownerId: string;
  readonly description: string | null;
  readonly budgetAmount: number;
  readonly currency: string;
  readonly deletedAt: Date | null;
}

export interface TripUpdate {
  readonly title: string;
  readonly description: string | null;
  readonly startDate: string;
  readonly endDate: string;
  readonly budgetAmount: number;
  readonly currency: string;
  readonly expectedVersion: Version;
}

export class TripVersionConflictError extends Error {
  constructor() {
    super('Trip version does not match the expected version.');
    this.name = 'TripVersionConflictError';
  }
}

export class TripRepository {
  constructor(private readonly database: TransactionalDatabase) {}

  async create(trip: Trip): Promise<void> {
    await this.database.transaction(async (transaction) => {
      await transaction.query(
        `INSERT INTO trip_schema.trips
          (id, owner_id, title, start_date, end_date, status, budget_amount, currency, version)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          trip.getId().value,
          trip.getOwnerId().value,
          trip.getTitle().value,
          trip.getDateRange().startDate,
          trip.getDateRange().endDate,
          trip.getStatus(),
          trip.getBudget().amount,
          trip.getBudget().currency.value,
          trip.getVersion().value,
        ],
      );
      await transaction.query(
        `INSERT INTO trip_schema.trip_members (trip_id, user_id, role, permission, status)
         VALUES ($1, $2, 'OWNER', 'EDIT', 'ACTIVE')`,
        [trip.getId().value, trip.getOwnerId().value],
      );
      for (const day of trip.getDays()) {
        await transaction.query(
          `INSERT INTO trip_schema.trip_days (trip_id, date, day_index, status)
           VALUES ($1, $2, $3, 'ACTIVE')`,
          [trip.getId().value, day.date, day.dayIndex],
        );
      }
      for (const event of trip.pullDomainEvents()) {
        await transaction.query(
          `INSERT INTO trip_schema.outbox_events
            (id, aggregate_type, aggregate_id, event_type, event_version, payload, correlation_id, occurred_at)
           VALUES ($1, 'trip', $2, 'trip.created.v1', 1, $3::jsonb, $4, $5)`,
          [
            event.eventId,
            event.aggregateId.value,
            JSON.stringify({
              tripId: event.payload.tripId.value,
              ownerId: event.payload.ownerId.value,
              title: event.payload.title.value,
              startDate: event.payload.dateRange.startDate,
              endDate: event.payload.dateRange.endDate,
              dayCount: event.payload.dayCount,
            }),
            event.correlationId,
            event.occurredAt.toISOString(),
          ],
        );
      }
    });
  }

  async listForUser(userId: string): Promise<readonly TripListRow[]> {
    const result = await this.database.query<TripListRow>(
      `SELECT t.id, t.title, t.start_date AS "startDate", t.end_date AS "endDate", t.status,
              m.role, m.permission, t.version
         FROM trip_schema.trips t JOIN trip_schema.trip_members m ON m.trip_id = t.id
        WHERE m.user_id = $1 AND m.status = 'ACTIVE' AND t.deleted_at IS NULL
        ORDER BY t.updated_at DESC`,
      [userId],
    );
    return result.rows;
  }

  async getByIdForUser(
    id: string,
    userId: string,
  ): Promise<TripDetailRow | undefined> {
    const result = await this.database.query<TripDetailRow>(
      `SELECT t.id, t.owner_id AS "ownerId", t.title, t.description,
              t.start_date AS "startDate", t.end_date AS "endDate", t.status,
              t.budget_amount AS "budgetAmount", t.currency, t.version,
              t.deleted_at AS "deletedAt", m.role, m.permission
         FROM trip_schema.trips t JOIN trip_schema.trip_members m ON m.trip_id = t.id
        WHERE t.id = $1 AND m.user_id = $2 AND m.status = 'ACTIVE'`,
      [id, userId],
    );
    return result.rows[0];
  }

  async update(id: string, update: TripUpdate): Promise<Version> {
    const result = await this.database.query<{ version: number }>(
      `UPDATE trip_schema.trips
          SET title = $2, description = $3, start_date = $4, end_date = $5,
              budget_amount = $6, currency = $7, version = version + 1
        WHERE id = $1 AND deleted_at IS NULL AND version = $8
        RETURNING version`,
      [
        id,
        update.title,
        update.description,
        update.startDate,
        update.endDate,
        update.budgetAmount,
        update.currency,
        update.expectedVersion.value,
      ],
    );
    const row = result.rows[0];
    if (!row) throw new TripVersionConflictError();
    return Version.from(row.version);
  }

  async softDelete(id: string, expectedVersion: Version): Promise<Version> {
    const result = await this.database.query<{ version: number }>(
      `UPDATE trip_schema.trips
          SET status = 'DELETED', deleted_at = now(), version = version + 1
        WHERE id = $1 AND deleted_at IS NULL AND version = $2
        RETURNING version`,
      [id, expectedVersion.value],
    );
    const row = result.rows[0];
    if (!row) throw new TripVersionConflictError();
    return Version.from(row.version);
  }
}
