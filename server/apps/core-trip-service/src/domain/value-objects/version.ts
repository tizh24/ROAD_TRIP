import { DomainValidationError } from './domain-validation.error';

export class Version {
  private constructor(readonly value: number) {}

  static from(value: number): Version {
    if (!Number.isInteger(value) || value < 1) {
      throw new DomainValidationError(
        'VERSION_INVALID',
        'Version must be a positive integer.',
      );
    }
    return new Version(value);
  }

  next(): Version {
    return Version.from(this.value + 1);
  }
}
