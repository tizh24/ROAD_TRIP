export type DomainValidationCode =
  | 'INVALID_IDENTIFIER'
  | 'TRIP_TITLE_INVALID'
  | 'TRIP_DATE_RANGE_INVALID'
  | 'TRIP_DATE_RANGE_TOO_LONG'
  | 'MONEY_INVALID'
  | 'CURRENCY_INVALID'
  | 'VERSION_INVALID';

export class DomainValidationError extends Error {
  constructor(
    readonly code: DomainValidationCode,
    message: string,
  ) {
    super(message);
    this.name = 'DomainValidationError';
  }
}
