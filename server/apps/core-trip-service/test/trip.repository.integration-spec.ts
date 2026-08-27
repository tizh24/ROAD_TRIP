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
  Version,
} from '../src/domain/value-objects';
import {
  TripRepository,
  TripVersionConflictError,
} from '../src/infrastructure/database/trip.repository';

describe('TripRepository PostgreSQL integration', () => {
  const databaseUrl = process.env.TEST_DATABASE_URL;
  if (!databaseUrl) throw new Error('TEST_DATABASE_URL is required.');

  const database = new PostgresDatabase({
    connectionString: databaseUrl,
    applicationName: 'core-trip-repository-integration-test',
  });
  const repository = new TripRepository(database);
  const tripId = randomUUID();
  const ownerId = randomUUID();

  beforeAll(async () => {
    await database.query(
      `INSERT INTO auth.users (
         instance_id, id, aud, role, email, encrypted_password,
         email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
         created_at, updated_at, confirmation_token, email_change,
         email_change_token_new, recovery_token
       ) VALUES (
         '00000000-0000-0000-0000-000000000000', $1, 'authenticated',
         'authenticated', $2, '', now(),
         '{"provider":"email","providers":["email"]}'::jsonb,
         '{"full_name":"Repository Test User"}'::jsonb,
         now(), now(), '', '', '', ''
       )`,
      [ownerId, `repository-${ownerId}@example.test`],
    );
  });

  afterAll(async () => {
    await database.transaction(async (transaction) => {
      await transaction.query(
        'DELETE FROM trip_schema.outbox_events WHERE aggregate_id = $1',
        [tripId],
      );
      await transaction.query(
        'DELETE FROM trip_schema.trip_days WHERE trip_id = $1',
        [tripId],
      );
      await transaction.query(
        'DELETE FROM trip_schema.trip_members WHERE trip_id = $1',
        [tripId],
      );
      await transaction.query('DELETE FROM trip_schema.trips WHERE id = $1', [
        tripId,
      ]);
      await transaction.query(
        'DELETE FROM public.user_profiles WHERE id = $1',
        [ownerId],
      );
      await transaction.query('DELETE FROM auth.users WHERE id = $1', [
        ownerId,
      ]);
    });
    await database.close();
  });

  it('persists the aggregate atomically and enforces optimistic versions', async () => {
    await repository.create(
      Trip.create({
        id: TripId.create(tripId),
        ownerId: UserId.from(ownerId),
        title: TripTitle.from('Repository integration trip'),
        dateRange: DateRange.from('2026-09-01', '2026-09-03'),
        budget: Money.from(1_000_000, Currency.from('VND')),
        correlationId: 'trip-repository-integration',
      }),
    );

    await expect(repository.listForUser(ownerId)).resolves.toEqual([
      expect.objectContaining({ id: tripId, role: 'OWNER', version: 1 }),
    ]);
    await expect(repository.getByIdForUser(tripId, ownerId)).resolves.toEqual(
      expect.objectContaining({
        id: tripId,
        ownerId,
        title: 'Repository integration trip',
      }),
    );
    await expect(
      repository.update(tripId, {
        title: 'Updated integration trip',
        description: 'Verified against PostgreSQL',
        startDate: '2026-09-01',
        endDate: '2026-09-03',
        budgetAmount: 1_500_000,
        currency: 'VND',
        expectedVersion: Version.from(1),
      }),
    ).resolves.toMatchObject({ value: 2 });
    await expect(
      repository.update(tripId, {
        title: 'Stale write',
        description: null,
        startDate: '2026-09-01',
        endDate: '2026-09-03',
        budgetAmount: 0,
        currency: 'VND',
        expectedVersion: Version.from(1),
      }),
    ).rejects.toBeInstanceOf(TripVersionConflictError);
    await expect(
      repository.softDelete(tripId, Version.from(2)),
    ).resolves.toMatchObject({
      value: 3,
    });
  });
});
