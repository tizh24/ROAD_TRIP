import {
  Currency,
  DateRange,
  Money,
  TripId,
  TripTitle,
  UserId,
} from '../value-objects';
import { Trip, TripRuleError } from './index';

const owner = UserId.from('7f42c1e6-973b-4f9c-a8c1-1c833dbe16d7');
const member = UserId.from('1ce41eb1-0b86-4618-9999-3641566e825d');
const outsider = UserId.from('b6c23d91-fd37-49ca-b4be-15fbc7ec42c4');

describe('Trip aggregate', () => {
  it('creates one owner, sequential days, and a single TripCreated fact', () => {
    const trip = createTrip();
    expect(trip.getStatus()).toBe('PLANNING');
    expect(trip.getMembers()).toEqual([
      expect.objectContaining({
        userId: owner,
        role: 'OWNER',
        permission: 'EDIT',
      }),
    ]);
    expect(trip.getDays()).toEqual([
      { date: '2026-08-01', dayIndex: 1 },
      { date: '2026-08-02', dayIndex: 2 },
      { date: '2026-08-03', dayIndex: 3 },
    ]);
    expect(trip.pullDomainEvents()).toEqual([
      expect.objectContaining({
        type: 'TripCreated',
        correlationId: 'aggregate-test',
        payload: expect.objectContaining({ dayCount: 3, ownerId: owner }),
      }),
    ]);
    expect(trip.pullDomainEvents()).toEqual([]);
  });

  it('enforces the owner invariant and permission model', () => {
    const trip = createTrip();
    trip.addMember(owner, member, 'EDIT');
    expect(trip.canView(member)).toBe(true);
    expect(trip.canEdit(member)).toBe(true);
    expect(trip.canManageMembers(member)).toBe(false);
    expect(trip.canView(outsider)).toBe(false);
    expectRule(
      () => trip.addMember(member, outsider, 'VIEW'),
      'TRIP_PERMISSION_DENIED',
    );
    expectRule(
      () => trip.addMember(owner, member, 'VIEW'),
      'TRIP_MEMBER_DUPLICATE',
    );
  });

  it('allows only valid owner-authorized state transitions', () => {
    const trip = createTrip();
    expectRule(
      () => trip.transition(member, 'ONGOING'),
      'TRIP_PERMISSION_DENIED',
    );
    trip.transition(owner, 'ONGOING');
    trip.transition(owner, 'COMPLETED');
    expect(trip.getVersion().value).toBe(3);
    expectRule(
      () => trip.transition(owner, 'ONGOING'),
      'TRIP_STATE_TRANSITION_INVALID',
    );
  });
});

function createTrip(): Trip {
  return Trip.create({
    id: TripId.create('5dd05214-d51e-4f70-bb1f-7736945f9f65'),
    ownerId: owner,
    title: TripTitle.from('Northbound'),
    dateRange: DateRange.from('2026-08-01', '2026-08-03'),
    budget: Money.from(1_000_000, Currency.from('VND')),
    correlationId: 'aggregate-test',
    createdAt: new Date('2026-08-01T00:00:00.000Z'),
  });
}

function expectRule(
  callback: () => unknown,
  code: TripRuleError['code'],
): void {
  try {
    callback();
    throw new Error('Expected trip rule validation to fail.');
  } catch (error) {
    expect(error).toBeInstanceOf(TripRuleError);
    expect((error as TripRuleError).code).toBe(code);
  }
}
