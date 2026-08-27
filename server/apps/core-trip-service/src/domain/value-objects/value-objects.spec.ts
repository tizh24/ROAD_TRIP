import {
  Currency,
  DateRange,
  DomainValidationError,
  Money,
  TripId,
  TripTitle,
  UserId,
  Version,
} from './index';

const tripId = '5dd05214-d51e-4f70-bb1f-7736945f9f65';

describe('trip value objects', () => {
  it('validates UUID identifiers and normalizes their representation', () => {
    expect(TripId.create(tripId.toUpperCase()).value).toBe(tripId);
    expect(UserId.from(tripId).equals(UserId.from(tripId))).toBe(true);
    expectDomainCode(() => UserId.from('not-a-uuid'), 'INVALID_IDENTIFIER');
  });

  it('trims valid titles and rejects blank or oversized titles', () => {
    expect(TripTitle.from('  Hà Nội vòng quanh  ').value).toBe(
      'Hà Nội vòng quanh',
    );
    expectDomainCode(() => TripTitle.from('   '), 'TRIP_TITLE_INVALID');
    expectDomainCode(
      () => TripTitle.from('x'.repeat(121)),
      'TRIP_TITLE_INVALID',
    );
  });

  it('accepts inclusive date ranges through thirty days', () => {
    const range = DateRange.from('2026-08-01', '2026-08-30');
    expect(range.totalDays).toBe(30);
    expectDomainCode(
      () => DateRange.from('2026-08-30', '2026-08-01'),
      'TRIP_DATE_RANGE_INVALID',
    );
    expectDomainCode(
      () => DateRange.from('2026-08-01', '2026-08-31'),
      'TRIP_DATE_RANGE_TOO_LONG',
    );
    expectDomainCode(
      () => DateRange.from('2026-02-30', '2026-03-01'),
      'TRIP_DATE_RANGE_INVALID',
    );
  });

  it('accepts non-negative budgets with an uppercase currency', () => {
    const vnd = Currency.from('VND');
    expect(Money.from(0, vnd)).toMatchObject({ amount: 0, currency: vnd });
    expectDomainCode(() => Currency.from('vnd'), 'CURRENCY_INVALID');
    expectDomainCode(() => Money.from(-1, vnd), 'MONEY_INVALID');
    expectDomainCode(() => Money.from(Number.NaN, vnd), 'MONEY_INVALID');
  });

  it('requires a positive integer optimistic version', () => {
    expect(Version.from(1).next().value).toBe(2);
    expectDomainCode(() => Version.from(0), 'VERSION_INVALID');
    expectDomainCode(() => Version.from(1.5), 'VERSION_INVALID');
  });
});

function expectDomainCode(
  callback: () => unknown,
  code: DomainValidationError['code'],
): void {
  try {
    callback();
    throw new Error('Expected domain validation to fail.');
  } catch (error) {
    expect(error).toBeInstanceOf(DomainValidationError);
    expect((error as DomainValidationError).code).toBe(code);
  }
}
