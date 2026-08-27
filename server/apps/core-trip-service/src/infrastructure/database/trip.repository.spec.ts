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
  nextRows: Array<Record<string, unknown>> = [];
  async transaction<Result>(
    work: (transaction: FakeDatabase) => Promise<Result>,
  ): Promise<Result> {
    return work(this);
  }
  query(query: unknown, values?: unknown[]): Promise<unknown> {
    this.queries.push({ query, values });
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
