import {
  Currency,
  DateRange,
  Money,
  TripId,
  TripTitle,
  UserId,
  Version,
} from '../../domain/value-objects';
import { Trip } from '../../domain/trip';
import {
  TripRepository,
  TripVersionConflictError,
  type TransactionalDatabase,
} from './trip.repository';

class FakeDatabase {
  readonly queries: Array<{ query: unknown; values: unknown[] | undefined }> =
    [];
  queryHandler?: (
    query: string,
    values?: unknown[],
  ) => Array<Record<string, unknown>>;
  nextRows: Array<Record<string, unknown>> = [];
  async transaction<Result>(
    work: (transaction: FakeDatabase) => Promise<Result>,
  ): Promise<Result> {
    return work(this);
  }
  query(query: unknown, values?: unknown[]): Promise<unknown> {
    this.queries.push({ query, values });
    if (this.queryHandler) {
      return Promise.resolve({
        rows: this.queryHandler(String(query), values),
      });
    }
    return Promise.resolve({ rows: this.nextRows });
  }
}

describe('TripRepository', () => {
  it('writes a trip, owner, sequential days, and outbox event in one transaction', async () => {
    const database = new FakeDatabase();
    await new TripRepository(
      database as unknown as TransactionalDatabase,
    ).create(
      Trip.create({
        id: TripId.create('5dd05214-d51e-4f70-bb1f-7736945f9f65'),
        ownerId: UserId.from('7f42c1e6-973b-4f9c-a8c1-1c833dbe16d7'),
        title: TripTitle.from('Northbound'),
        dateRange: DateRange.from('2026-08-01', '2026-08-03'),
        budget: Money.from(0, Currency.from('VND')),
        correlationId: 'repository-test',
      }),
    );
    expect(database.queries).toHaveLength(6);
    expect(database.queries.map((entry) => String(entry.query))).toEqual(
      expect.arrayContaining([
        expect.stringContaining('trip_schema.trips'),
        expect.stringContaining('trip_schema.trip_members'),
        expect.stringContaining('trip_schema.outbox_events'),
      ]),
    );
  });

  it('clones a published trip and records TripCloned outbox event', async () => {
    const database = new FakeDatabase();
    database.queryHandler = (query) => {
      if (
        query.includes(
          "SELECT id FROM trip_schema.trips WHERE id=$1 AND visibility='PUBLISHED'",
        )
      ) {
        return [{ id: 'source-1' }];
      }
      if (
        query.includes('INSERT INTO trip_schema.trips') &&
        query.includes('RETURNING id')
      ) {
        return [{ id: 'cloned-1' }];
      }
      if (
        query.includes(
          'FROM trip_schema.trips t JOIN trip_schema.trip_members m',
        )
      ) {
        return [
          {
            id: 'cloned-1',
            ownerId: 'owner-1',
            title: 'Cloned Trip',
            startDate: '2026-08-01',
            endDate: '2026-08-03',
            status: 'PLANNING',
            role: 'OWNER',
            permission: 'EDIT',
            version: 1,
            budgetAmount: 0,
            currency: 'VND',
            deletedAt: null,
            description: null,
          },
        ];
      }
      return [];
    };

    const repository = new TripRepository(
      database as unknown as TransactionalDatabase,
    );
    const result = await repository.clonePublished(
      'source-1',
      'owner-1',
      'cloned-1',
      'corr-clone-1',
    );

    expect(result).toBeDefined();
    expect(result?.id).toBe('cloned-1');
    expect(database.queries.map((entry) => String(entry.query))).toEqual(
      expect.arrayContaining([
        expect.stringContaining("visibility='PUBLISHED'"),
        expect.stringContaining('trip_schema.trips'),
        expect.stringContaining('trip_schema.trip_members'),
        expect.stringContaining('trip_schema.trip_days'),
        expect.stringContaining('trip_schema.trip_stops'),
        expect.stringContaining('trip_schema.outbox_events'),
      ]),
    );

    const outboxQuery = database.queries.find((entry) =>
      String(entry.query).includes('trip_schema.outbox_events'),
    );
    expect(outboxQuery?.values).toEqual(
      expect.arrayContaining([
        'TRIP',
        'cloned-1',
        'TripCloned',
        expect.stringContaining('"sourceTripId":"source-1"'),
        'corr-clone-1',
      ]),
    );
  });

  it('skips clone when source trip is not published or missing', async () => {
    const database = new FakeDatabase();
    database.queryHandler = () => [];
    const repository = new TripRepository(
      database as unknown as TransactionalDatabase,
    );
    const result = await repository.clonePublished(
      'source-missing',
      'owner-1',
      'cloned-1',
    );
    expect(result).toBeUndefined();
    expect(database.queries).toHaveLength(2); // SELECT source check + getByIdForUser query
  });

  it('uses expected version for update and surfaces a conflict', async () => {
    const database = new FakeDatabase();
    const repository = new TripRepository(
      database as unknown as TransactionalDatabase,
    );
    await expect(
      repository.update('trip', {
        title: 'New',
        description: null,
        startDate: '2026-08-01',
        endDate: '2026-08-03',
        budgetAmount: 0,
        currency: 'VND',
        expectedVersion: Version.from(1),
      }),
    ).rejects.toBeInstanceOf(TripVersionConflictError);
    database.nextRows = [{ version: 2 }];
    await expect(
      repository.softDelete('trip', Version.from(1)),
    ).resolves.toMatchObject({ value: 2 });
  });
});
