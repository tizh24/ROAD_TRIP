import { DomainValidationError } from './domain-validation.error';

export class TripTitle {
  static readonly maxLength = 160;

  private constructor(readonly value: string) {}

  static from(value: string): TripTitle {
    const trimmed = value.trim();
    if (!trimmed || trimmed.length > TripTitle.maxLength) {
      throw new DomainValidationError(
        'TRIP_TITLE_INVALID',
        `Trip title must contain 1 to ${TripTitle.maxLength} non-whitespace characters.`,
      );
    }
    return new TripTitle(trimmed);
  }
}
