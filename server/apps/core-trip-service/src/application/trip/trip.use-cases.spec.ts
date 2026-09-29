import { StopRepositoryError } from '../../infrastructure/database/stop.repository';
import { TripVersionConflictError } from '../../infrastructure/database/trip.repository';
import {
  TripAuthorizationPolicy,
  type TripAccessReader,
} from '../authorization/trip-authorization.policy';
import { mapTripApplicationError, TripUseCases } from './trip.use-cases';

const actorId = '00000000-0000-4000-8000-000000000001';
const tripId = '00000000-0000-4000-8000-000000000002';

class OwnerReader implements TripAccessReader {
  getAccessRecord() {
    return Promise.resolve({ tripExists: true, ownerId: actorId });
  }
}

describe('TripUseCases', () => {
  it('creates a trip once for the same idempotency key', async () => {
    const created = {
      id: tripId,
      ownerId: actorId,
      title: 'North loop',
      description: null,
      startDate: '2026-09-01',
      endDate: '2026-09-02',
      status: 'PLANNING',
      budgetAmount: 0,
      currency: 'VND',
      deletedAt: null,
      role: 'OWNER',
      permission: 'EDIT',
      version: 1,
    };
    const trips = {
      getByIdForUser: jest
        .fn()
        .mockResolvedValueOnce(undefined)
        .mockResolvedValue(created),
      create: jest.fn().mockResolvedValue(undefined),
    };
    const useCases = new TripUseCases(
      trips as never,
      {} as never,
      new TripAuthorizationPolicy(new OwnerReader()),
    );

    await expect(
      useCases.create({
        actorId,
        title: ' North loop ',
        startDate: '2026-09-01',
        endDate: '2026-09-02',
        correlationId: 'correlation-1',
        idempotencyKey: 'create-1',
      }),
    ).resolves.toEqual(created);
    expect(trips.create).toHaveBeenCalledTimes(1);
  });

  it('maps optimistic-lock and stop errors to stable application errors', () => {
    expect(
      mapTripApplicationError(new TripVersionConflictError()),
    ).toMatchObject({
      code: 'TRIP_VERSION_CONFLICT',
    });
    expect(
      mapTripApplicationError(
        new StopRepositoryError('STOP_NOT_FOUND', 'missing'),
      ),
    ).toMatchObject({ code: 'STOP_NOT_FOUND' });
  });
});
