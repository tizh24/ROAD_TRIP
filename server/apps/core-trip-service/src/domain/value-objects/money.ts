import { DomainValidationError } from './domain-validation.error';

const currencyPattern = /^[A-Z]{3}$/;

export class Currency {
  private constructor(readonly value: string) {}

  static from(value: string): Currency {
    if (!currencyPattern.test(value)) {
      throw new DomainValidationError(
        'CURRENCY_INVALID',
        'Currency must be a three-letter uppercase ISO code.',
      );
    }
    return new Currency(value);
  }
}

export class Money {
  private constructor(
    readonly amount: number,
    readonly currency: Currency,
  ) {}

  static from(amount: number, currency: Currency): Money {
    if (!Number.isFinite(amount) || amount < 0) {
      throw new DomainValidationError(
        'MONEY_INVALID',
        'Budget amount must be a finite non-negative number.',
      );
    }
    return new Money(amount, currency);
  }
}
