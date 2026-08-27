import type { QueryExecutor } from '@roadtrip/db-client';
import type { TransactionalDatabase } from './trip.repository';

export type StopRepositoryErrorCode =
  | 'STOP_NOT_FOUND'
  | 'DAY_NOT_FOUND'
  | 'STOP_ORDER_INVALID'
  | 'STOP_DAY_MISMATCH'
  | 'STOP_VERSION_CONFLICT';

export class StopRepositoryError extends Error {
  constructor(
    readonly code: StopRepositoryErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'StopRepositoryError';
  }
}

export interface AddStopRecord {
  readonly id: string;
  readonly tripId: string;
  readonly dayId: string;
  readonly placeId: string;
  readonly name: string;
  readonly address: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly notes?: string;
}

export interface UpdateStopRecord {
  readonly name: string;
  readonly address: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly notes: string | null;
  readonly expectedVersion: number;
}

export interface StopRecord {
  readonly id: string;
  readonly tripId: string;
  readonly dayId: string;
  readonly stopIndex: number;
  readonly version: number;
}

export class StopRepository {
  constructor(private readonly database: TransactionalDatabase) {}

  add(input: AddStopRecord): Promise<StopRecord> {
    return this.database.transaction(async (transaction) => {
      await assertOwnedDay(transaction, input.tripId, input.dayId);
      const next = await transaction.query<{ stopIndex: number }>(
        `SELECT COALESCE(max(stop_index), 0) + 1 AS "stopIndex"
           FROM trip_schema.trip_stops WHERE day_id = $1`,
        [input.dayId],
      );
      const result = await transaction.query<StopRecord>(
        `INSERT INTO trip_schema.trip_stops
          (id, trip_id, day_id, place_id, name, address, latitude, longitude, notes, stop_index)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         RETURNING id, trip_id AS "tripId", day_id AS "dayId",
                   stop_index AS "stopIndex", version`,
        [
          input.id,
          input.tripId,
          input.dayId,
          input.placeId,
          input.name,
          input.address,
          input.latitude,
          input.longitude,
          input.notes ?? null,
          next.rows[0]!.stopIndex,
        ],
      );
      return result.rows[0]!;
    });
  }

  async update(
    tripId: string,
    stopId: string,
    update: UpdateStopRecord,
  ): Promise<number> {
    const result = await this.database.query<{ version: number }>(
      `UPDATE trip_schema.trip_stops
          SET name=$3, address=$4, latitude=$5, longitude=$6, notes=$7,
              version=version+1
        WHERE id=$1 AND trip_id=$2 AND version=$8
        RETURNING version`,
      [
        stopId,
        tripId,
        update.name,
        update.address,
        update.latitude,
        update.longitude,
        update.notes,
        update.expectedVersion,
      ],
    );
    if (!result.rows[0]) {
      throw new StopRepositoryError(
        'STOP_VERSION_CONFLICT',
        'Stop version does not match.',
      );
    }
    return result.rows[0].version;
  }

  remove(tripId: string, stopId: string): Promise<void> {
    return this.database.transaction(async (transaction) => {
      const stop = await lockStop(transaction, tripId, stopId);
      await transaction.query(
        'DELETE FROM trip_schema.trip_stops WHERE id=$1',
        [stopId],
      );
      await compactDay(transaction, stop.dayId);
    });
  }

  reorder(
    tripId: string,
    dayId: string,
    orderedIds: readonly string[],
  ): Promise<void> {
    return this.database.transaction(async (transaction) => {
      await assertOwnedDay(transaction, tripId, dayId);
      const current = await lockDayStops(transaction, dayId);
      assertExactOrder(
        current.map((row) => row.id),
        orderedIds,
      );
      await applyOrder(transaction, dayId, orderedIds);
    });
  }

  move(
    tripId: string,
    stopId: string,
    targetDayId: string,
    targetIndex: number,
  ): Promise<void> {
    return this.database.transaction(async (transaction) => {
      const stop = await lockStop(transaction, tripId, stopId);
      await assertOwnedDay(transaction, tripId, targetDayId);
      const dayIds = [...new Set([stop.dayId, targetDayId])].sort();
      await transaction.query(
        'SELECT id FROM trip_schema.trip_days WHERE id = ANY($1::uuid[]) ORDER BY id FOR UPDATE',
        [dayIds],
      );
      const sourceIds = (await lockDayStops(transaction, stop.dayId))
        .map((row) => row.id)
        .filter((id) => id !== stopId);
      const targetIds =
        stop.dayId === targetDayId
          ? [...sourceIds]
          : (await lockDayStops(transaction, targetDayId)).map((row) => row.id);
      if (
        !Number.isInteger(targetIndex) ||
        targetIndex < 1 ||
        targetIndex > targetIds.length + 1
      ) {
        throw new StopRepositoryError(
          'STOP_ORDER_INVALID',
          'Target index is invalid.',
        );
      }
      targetIds.splice(targetIndex - 1, 0, stopId);
      await raiseIndexes(transaction, dayIds);
      await transaction.query(
        'UPDATE trip_schema.trip_stops SET day_id=$2 WHERE id=$1 AND trip_id=$3',
        [stopId, targetDayId, tripId],
      );
      if (stop.dayId !== targetDayId)
        await writeIndexes(transaction, sourceIds);
      await writeIndexes(transaction, targetIds);
    });
  }
}

async function assertOwnedDay(
  executor: QueryExecutor,
  tripId: string,
  dayId: string,
) {
  const result = await executor.query(
    'SELECT id FROM trip_schema.trip_days WHERE id=$1 AND trip_id=$2 FOR UPDATE',
    [dayId, tripId],
  );
  if (!result.rows[0]) {
    throw new StopRepositoryError(
      'STOP_DAY_MISMATCH',
      'Day does not belong to the trip.',
    );
  }
}

async function lockStop(
  executor: QueryExecutor,
  tripId: string,
  stopId: string,
) {
  const result = await executor.query<{ id: string; dayId: string }>(
    'SELECT id, day_id AS "dayId" FROM trip_schema.trip_stops WHERE id=$1 AND trip_id=$2 FOR UPDATE',
    [stopId, tripId],
  );
  if (!result.rows[0])
    throw new StopRepositoryError('STOP_NOT_FOUND', 'Stop does not exist.');
  return result.rows[0];
}

async function lockDayStops(executor: QueryExecutor, dayId: string) {
  const result = await executor.query<{ id: string }>(
    'SELECT id FROM trip_schema.trip_stops WHERE day_id=$1 ORDER BY stop_index FOR UPDATE',
    [dayId],
  );
  return result.rows;
}

function assertExactOrder(
  current: readonly string[],
  ordered: readonly string[],
) {
  if (
    current.length !== ordered.length ||
    new Set(ordered).size !== ordered.length ||
    !ordered.every((id) => current.includes(id))
  ) {
    throw new StopRepositoryError(
      'STOP_ORDER_INVALID',
      'Order must contain every stop exactly once.',
    );
  }
}

async function raiseIndexes(
  executor: QueryExecutor,
  dayIds: readonly string[],
) {
  await executor.query(
    'UPDATE trip_schema.trip_stops SET stop_index=stop_index+1000000 WHERE day_id = ANY($1::uuid[])',
    [dayIds],
  );
}

async function writeIndexes(executor: QueryExecutor, ids: readonly string[]) {
  for (const [index, id] of ids.entries()) {
    await executor.query(
      'UPDATE trip_schema.trip_stops SET stop_index=$2 WHERE id=$1',
      [id, index + 1],
    );
  }
}

async function applyOrder(
  executor: QueryExecutor,
  dayId: string,
  ids: readonly string[],
) {
  await raiseIndexes(executor, [dayId]);
  await writeIndexes(executor, ids);
}

async function compactDay(executor: QueryExecutor, dayId: string) {
  const ids = (await lockDayStops(executor, dayId)).map((row) => row.id);
  await applyOrder(executor, dayId, ids);
}
