import { randomUUID } from 'node:crypto';
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
  readonly visibility?: string;
  readonly sourceTripId?: string | null;
  readonly deletedAt: Date | null;
  readonly days: readonly TripDayRow[];
}

export interface PublicTripRow {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly startDate: string;
  readonly endDate: string;
  readonly budgetAmount: number;
  readonly currency: string;
  readonly days: readonly TripDayRow[];
}

export interface TripDayRow {
  readonly id: string;
  readonly date: string;
  readonly dayIndex: number;
  readonly stops: readonly TripStopRow[];
}

export interface TripStopRow {
  readonly id: string;
  readonly placeId: string;
  readonly name: string;
  readonly address: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly notes: string | null;
  readonly stopIndex: number;
  readonly version: number;
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

export class TripIncompleteForPublicationError extends Error {
  constructor(message = 'Trip must have at least one stop before it can be published.') {
    super(message);
    this.name = 'TripIncompleteForPublicationError';
  }
}

export class TripRepository {
  constructor(private readonly database: TransactionalDatabase) {}

  async create(trip: Trip): Promise<void> {
    await this.database.transaction(async (transaction) => {
      await transaction.query(
        `INSERT INTO trip_schema.trips
          (id, owner_id, title, description, start_date, end_date, status, budget_amount, currency, version)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING`,
        [
          trip.getId().value,
          trip.getOwnerId().value,
          trip.getTitle().value,
          trip.getDescription(),
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
      `SELECT t.id, t.title, t.start_date::text AS "startDate", t.end_date::text AS "endDate", t.status,
              m.role, m.permission, t.version
         FROM trip_schema.trips t JOIN trip_schema.trip_members m ON m.trip_id = t.id
        WHERE m.user_id = $1 AND m.status = 'ACTIVE' AND t.deleted_at IS NULL
        ORDER BY t.updated_at DESC`,
      [userId],
    );
    return result.rows;
  }

  async listPublished(): Promise<readonly Pick<PublicTripRow, 'id' | 'title' | 'description' | 'startDate' | 'endDate' | 'budgetAmount' | 'currency'>[]> {
    const result = await this.database.query<Pick<PublicTripRow, 'id' | 'title' | 'description' | 'startDate' | 'endDate' | 'budgetAmount' | 'currency'>>(
      `SELECT id, title, description, start_date::text AS "startDate", end_date::text AS "endDate", budget_amount::float8 AS "budgetAmount", currency
         FROM trip_schema.trips
        WHERE visibility = 'PUBLISHED' AND deleted_at IS NULL
        ORDER BY published_at DESC, updated_at DESC
        LIMIT 50`,
    );
    return result.rows;
  }

  async getPublished(id: string): Promise<PublicTripRow | undefined> {
    const trip = await this.database.query<Omit<PublicTripRow, 'days'>>(
      `SELECT id, title, description, start_date::text AS "startDate", end_date::text AS "endDate", budget_amount::float8 AS "budgetAmount", currency
         FROM trip_schema.trips
        WHERE id=$1 AND visibility='PUBLISHED' AND deleted_at IS NULL`,
      [id],
    );
    const row = trip.rows[0];
    if (!row) return undefined;
    const detail = await this.getPublicDays(id);
    return { ...row, days: detail };
  }

  async clonePublished(
    sourceTripId: string,
    ownerId: string,
    id: string,
    correlationId?: string,
  ): Promise<TripDetailRow | undefined> {
    await this.database.transaction(async (transaction) => {
      const source = await transaction.query<{ id: string }>(
        `SELECT id FROM trip_schema.trips WHERE id=$1 AND visibility='PUBLISHED' AND deleted_at IS NULL FOR SHARE`,
        [sourceTripId],
      );
      if (!source.rows[0]) return;
      const inserted = await transaction.query<{ id: string }>(
        `INSERT INTO trip_schema.trips (id, owner_id, title, description, start_date, end_date, status, budget_amount, currency, version, visibility, source_trip_id)
         SELECT $2, $3, title, description, start_date, end_date, 'PLANNING', budget_amount, currency, 1, 'PRIVATE', id
           FROM trip_schema.trips WHERE id=$1
         ON CONFLICT (id) DO NOTHING
         RETURNING id`,
        [sourceTripId, id, ownerId],
      );
      if (!inserted.rows[0]) return;

      await transaction.query(
        `INSERT INTO trip_schema.trip_members (trip_id,user_id,role,permission,status) VALUES ($1,$2,'OWNER','EDIT','ACTIVE') ON CONFLICT DO NOTHING`,
        [id, ownerId],
      );
      await transaction.query(
        `INSERT INTO trip_schema.trip_days (id, trip_id, date, day_index, status)
         SELECT gen_random_uuid(), $2, date, day_index, 'ACTIVE' FROM trip_schema.trip_days WHERE trip_id=$1
         ON CONFLICT (trip_id, day_index) DO NOTHING`,
        [sourceTripId, id],
      );
      await transaction.query(
        `INSERT INTO trip_schema.trip_stops (id, trip_id, day_id, place_id, name, address, latitude, longitude, notes, stop_index, status, version)
         SELECT gen_random_uuid(), $2, target_day.id, stop.place_id, stop.name, stop.address, stop.latitude, stop.longitude, stop.notes, stop.stop_index, 'ACTIVE', 1
           FROM trip_schema.trip_stops stop
           JOIN trip_schema.trip_days source_day ON source_day.id=stop.day_id
           JOIN trip_schema.trip_days target_day ON target_day.trip_id=$2 AND target_day.day_index=source_day.day_index
          WHERE stop.trip_id=$1 AND stop.status='ACTIVE'
         ON CONFLICT (day_id, stop_index) DO NOTHING`,
        [sourceTripId, id],
      );
      await transaction.query(
        `INSERT INTO trip_schema.outbox_events
          (id, aggregate_type, aggregate_id, event_type, payload, correlation_id, occurred_at)
         VALUES ($1, $2, $3, $4, $5, $6, now())`,
        [
          randomUUID(),
          'TRIP',
          id,
          'TripCloned',
          JSON.stringify({
            tripId: id,
            sourceTripId,
            ownerId,
          }),
          correlationId ?? id,
        ],
      );
    });
    return this.getByIdForUser(id, ownerId);
  }

  private async getPublicDays(id: string): Promise<readonly TripDayRow[]> {
    const days = await this.database.query<{ id: string; date: string; dayIndex: number }>(
      `SELECT id, date::text AS date, day_index AS "dayIndex" FROM trip_schema.trip_days WHERE trip_id=$1 AND status='ACTIVE' ORDER BY day_index`, [id]);
    const stops = await this.database.query<TripStopRow & { dayId: string }>(
      `SELECT id, day_id AS "dayId", place_id AS "placeId", name, address, latitude::float8 AS latitude, longitude::float8 AS longitude, notes, stop_index AS "stopIndex", version FROM trip_schema.trip_stops WHERE trip_id=$1 AND status='ACTIVE' ORDER BY stop_index`, [id]);
    return days.rows.map((day) => ({ ...day, stops: stops.rows.filter((stop) => stop.dayId === day.id).map(({ dayId: _dayId, ...stop }) => stop) }));
  }

  async getByIdForUser(
    id: string,
    userId: string,
  ): Promise<TripDetailRow | undefined> {
    const result = await this.database.query<TripDetailRow>(
      `SELECT t.id, t.owner_id AS "ownerId", t.title, t.description,
              t.start_date::text AS "startDate", t.end_date::text AS "endDate", t.status,
              t.budget_amount::float8 AS "budgetAmount", t.currency, t.version,
              t.visibility, t.source_trip_id AS "sourceTripId",
              t.deleted_at AS "deletedAt", m.role, m.permission
         FROM trip_schema.trips t JOIN trip_schema.trip_members m ON m.trip_id = t.id
        WHERE t.id = $1 AND m.user_id = $2 AND m.status = 'ACTIVE'`,
      [id, userId],
    );
    const trip = result.rows[0];
    if (!trip) return undefined;
    const days = await this.database.query<{
      id: string;
      date: string;
      dayIndex: number;
    }>(
      `SELECT id, date::text AS date, day_index AS "dayIndex"
         FROM trip_schema.trip_days WHERE trip_id = $1 ORDER BY day_index`,
      [id],
    );
    const stops = await this.database.query<TripStopRow & { dayId: string }>(
      `SELECT id, day_id AS "dayId", place_id AS "placeId", name, address,
              latitude::float8 AS latitude, longitude::float8 AS longitude,
              notes, stop_index AS "stopIndex", version
         FROM trip_schema.trip_stops WHERE trip_id = $1 ORDER BY stop_index`,
      [id],
    );
    return {
      ...trip,
      days: days.rows.map((day) => ({
        ...day,
        stops: stops.rows
          .filter((stop) => stop.dayId === day.id)
          .map((stop) => ({
            id: stop.id,
            placeId: stop.placeId,
            name: stop.name,
            address: stop.address,
            latitude: stop.latitude,
            longitude: stop.longitude,
            notes: stop.notes,
            stopIndex: stop.stopIndex,
            version: stop.version,
          })),
      })),
    };
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

  async updateVisibility(
    tripId: string,
    actorId: string,
    visibility: 'PRIVATE' | 'UNLISTED' | 'PUBLISHED',
    correlationId?: string,
  ): Promise<{ visibility: string; publishedAt: string | null; version: number }> {
    return this.database.transaction(async (transaction) => {
      const current = await transaction.query<{
        id: string;
        visibility: string;
        version: number;
      }>(
        `SELECT id, visibility, version FROM trip_schema.trips WHERE id=$1 AND deleted_at IS NULL FOR UPDATE`,
        [tripId],
      );
      const row = current.rows[0];
      if (!row) throw new TripVersionConflictError();

      if (visibility === 'PUBLISHED') {
        const stopCount = await transaction.query<{ count: string }>(
          `SELECT COUNT(*) AS count FROM trip_schema.trip_stops WHERE trip_id=$1 AND status='ACTIVE'`,
          [tripId],
        );
        if (parseInt(stopCount.rows[0]?.count || '0', 10) === 0) {
          throw new TripIncompleteForPublicationError(
            'Chuyến đi cần có ít nhất một điểm dừng trước khi có thể công khai.',
          );
        }
      }

      const updated = await transaction.query<{
        visibility: string;
        published_at: string | null;
        version: number;
      }>(
        `UPDATE trip_schema.trips
            SET visibility = $2,
                published_at = CASE WHEN $2 = 'PUBLISHED' THEN now() ELSE NULL END,
                version = version + 1
          WHERE id = $1
          RETURNING visibility, published_at::text AS "published_at", version`,
        [tripId, visibility],
      );

      await transaction.query(
        `INSERT INTO trip_schema.trip_audit_logs (trip_id, actor_id, action, old_values, new_values, correlation_id)
         VALUES ($1, $2, 'VISIBILITY_CHANGE', $3, $4, $5)`,
        [
          tripId,
          actorId,
          JSON.stringify({ visibility: row.visibility }),
          JSON.stringify({ visibility }),
          correlationId || null,
        ],
      );

      const res = updated.rows[0]!;
      return {
        visibility: res.visibility,
        publishedAt: res.published_at,
        version: res.version,
      };
    });
  }
}
