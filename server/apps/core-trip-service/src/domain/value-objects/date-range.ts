import { DomainValidationError } from './domain-validation.error';

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const millisecondsPerDay = 86_400_000;

export class DateRange {
  static readonly maxDays = 30;

  private constructor(
    readonly startDate: string,
    readonly endDate: string,
    readonly totalDays: number,
  ) {}

  static from(startDate: string, endDate: string): DateRange {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    if (end < start) {
      throw new DomainValidationError(
        'TRIP_DATE_RANGE_INVALID',
        'Trip end date cannot be before its start date.',
      );
    }
    const totalDays = (end - start) / millisecondsPerDay + 1;
    if (totalDays > DateRange.maxDays) {
      throw new DomainValidationError(
        'TRIP_DATE_RANGE_TOO_LONG',
        `Trip date range cannot exceed ${DateRange.maxDays} days.`,
      );
    }
    return new DateRange(startDate, endDate, totalDays);
  }
}

function parseDate(value: string): number {
  if (!datePattern.test(value)) {
    throw new DomainValidationError(
      'TRIP_DATE_RANGE_INVALID',
      'Trip dates must use the YYYY-MM-DD format.',
    );
  }
  const parts = value.split('-').map(Number);
  const [year, month, day] = parts;
  if (year === undefined || month === undefined || day === undefined) {
    throw new DomainValidationError(
      'TRIP_DATE_RANGE_INVALID',
      'Trip date is invalid.',
    );
  }
  const timestamp = Date.UTC(year, month - 1, day);
  const parsed = new Date(timestamp);
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw new DomainValidationError(
      'TRIP_DATE_RANGE_INVALID',
      'Trip date is invalid.',
    );
  }
  return timestamp;
}
