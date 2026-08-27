import { randomUUID } from 'node:crypto';
import { DomainValidationError } from './domain-validation.error';

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

abstract class UuidIdentifier {
  protected constructor(readonly value: string) {}

  equals(other: UuidIdentifier): boolean {
    return this.value === other.value;
  }
}

export class TripId extends UuidIdentifier {
  static create(value: string = randomUUID()): TripId {
    return new TripId(validateUuid(value, 'Trip ID'));
  }
}

export class UserId extends UuidIdentifier {
  static from(value: string): UserId {
    return new UserId(validateUuid(value, 'User ID'));
  }
}

function validateUuid(value: string, label: string): string {
  if (!uuidPattern.test(value)) {
    throw new DomainValidationError(
      'INVALID_IDENTIFIER',
      `${label} must be a UUID.`,
    );
  }
  return value.toLowerCase();
}
