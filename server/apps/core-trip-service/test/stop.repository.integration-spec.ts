import { randomUUID } from 'node:crypto';
import { PostgresDatabase } from '@roadtrip/db-client';
import { Trip } from '../src/domain/trip';
import {
  Currency,
  DateRange,
  Money,
  TripId,
  TripTitle,
  UserId,
} from '../src/domain/value-objects';
import { StopRepository } from '../src/infrastructure/database/stop.repository';
import { TripRepository } from '../src/infrastructure/database/trip.repository';

describe('StopRepository PostgreSQL integration', () => {
  const databaseUrl = process.env.TEST_DATABASE_URL;
  if (!databaseUrl) throw new Error('TEST_DATABASE_URL is required.');
  const database = new PostgresDatabase({
    connectionString: databaseUrl,
    applicationName: 'stop-repository-integration-test',
  });
  const trips = new TripRepository(database);
  const stops = new StopRepository(database);
  const ownerId = randomUUID();
  const firstTripId = randomUUID();
  const secondTripId = randomUUID();
  const createdStopIds: string[] = [];
  let firstDayId: string;
  let secondDayId: string;
  let foreignDayId: string;

  beforeAll(async () => {
    await database.query(
      `INSERT INTO auth.users (
         instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,
         raw_app_meta_data,raw_user_meta_data,created_at,updated_at,
         confirmation_token,email_change,email_change_token_new,recovery_token
       ) VALUES (
         '00000000-0000-0000-0000-000000000000',$1,'authenticated','authenticated',
         $2,'',now(),'{"provider":"email","providers":["email"]}'::jsonb,
         '{"full_name":"Stop Repository Test"}'::jsonb,now(),now(),'','','',''
       )`,
      [ownerId, `stop-repository-${ownerId}@example.test`],
    );
    await trips.create(
      createTrip(firstTripId, ownerId, '2026-10-01', '2026-10-02'),
    );
    await trips.create(
      createTrip(secondTripId, ownerId, '2026-11-01', '2026-11-01'),
    );
    const days = await database.query<{
      id: string;
      tripId: string;
      dayIndex: number;
    }>(
      `SELECT id,trip_id AS "tripId",day_index AS "dayIndex"
         FROM trip_schema.trip_days WHERE trip_id = ANY($1::uuid[])
        ORDER BY trip_id,day_index`,
      [[firstTripId, secondTripId]],
    );
    firstDayId = days.rows.find(
      (day) => day.tripId === firstTripId && day.dayIndex === 1,
    )!.id;
    secondDayId = days.rows.find(
      (day) => day.tripId === firstTripId && day.dayIndex === 2,
    )!.id;
    foreignDayId = days.rows.find((day) => day.tripId === secondTripId)!.id;
  });

  afterAll(async () => {
    await database.transaction(async (transaction) => {
      await transaction.query(
        'DELETE FROM trip_schema.trip_stops WHERE trip_id = ANY($1::uuid[])',
        [[firstTripId, secondTripId]],
      );
      await transaction.query(
        'DELETE FROM trip_schema.outbox_events WHERE aggregate_id = ANY($1::uuid[])',
        [[firstTripId, secondTripId]],
      );
      await transaction.query(
        'DELETE FROM trip_schema.trip_days WHERE trip_id = ANY($1::uuid[])',
        [[firstTripId, secondTripId]],
      );
      await transaction.query(
        'DELETE FROM trip_schema.trip_members WHERE trip_id = ANY($1::uuid[])',
        [[firstTripId, secondTripId]],
      );
      await transaction.query(
        'DELETE FROM trip_schema.trips WHERE id = ANY($1::uuid[])',
        [[firstTripId, secondTripId]],
      );
      await transaction.query('DELETE FROM public.user_profiles WHERE id=$1', [
        ownerId,
      ]);
      await transaction.query('DELETE FROM auth.users WHERE id=$1', [ownerId]);
    });
    await database.close();
  });

  it('adds, updates, reorders, moves, removes, and serializes concurrent adds', async () => {
    const first = await addStop('first', firstDayId);
    const second = await addStop('second', firstDayId);
    expect([first.stopIndex, second.stopIndex]).toEqual([1, 2]);
    await stops.reorder(firstTripId, firstDayId, [second.id, first.id]);
    await expect(
      stops.update(firstTripId, first.id, {
        name: 'Updated stop',
        address: 'Hà Nội',
        latitude: 21.0285,
        longitude: 105.8542,
        notes: 'updated',
        expectedVersion: 1,
      }),
    ).resolves.toBe(2);
    await stops.move(firstTripId, second.id, secondDayId, 1);
    await stops.remove(firstTripId, first.id);
    const concurrentIds = [randomUUID(), randomUUID()];
    createdStopIds.push(...concurrentIds);
    await Promise.all(
      concurrentIds.map((id, index) =>
        stops.add(stopInput(id, `concurrent-${index}`, secondDayId)),
      ),
    );
    const ordered = await database.query<{ stopIndex: number }>(
      'SELECT stop_index AS "stopIndex" FROM trip_schema.trip_stops WHERE day_id=$1 ORDER BY stop_index',
      [secondDayId],
    );
    expect(ordered.rows.map((row) => row.stopIndex)).toEqual([1, 2, 3]);
  });

  it('rejects cross-trip day mutation', async () => {
    const stop = await addStop('cross-trip', firstDayId);
    await expect(
      stops.move(firstTripId, stop.id, foreignDayId, 1),
    ).rejects.toMatchObject({
      code: 'STOP_DAY_MISMATCH',
    });
  });

  async function addStop(label: string, dayId: string) {
    const id = randomUUID();
    createdStopIds.push(id);
    return stops.add(stopInput(id, label, dayId));
  }

  function stopInput(id: string, label: string, dayId: string) {
    return {
      id,
      tripId: firstTripId,
      dayId,
      placeId: `place-${label}`,
      name: label,
      address: 'Việt Nam',
      latitude: 21.0285,
      longitude: 105.8542,
    };
  }
});

function createTrip(
  id: string,
  ownerId: string,
  startDate: string,
  endDate: string,
): Trip {
  return Trip.create({
    id: TripId.create(id),
    ownerId: UserId.from(ownerId),
    title: TripTitle.from(`Integration ${id.slice(0, 8)}`),
    dateRange: DateRange.from(startDate, endDate),
    budget: Money.from(0, Currency.from('VND')),
    correlationId: `stop-repository-${id}`,
  });
}
