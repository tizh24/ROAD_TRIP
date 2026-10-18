import { createHash, randomUUID } from 'node:crypto';
import {
  Currency,
  DateRange,
  DomainValidationError,
  Money,
  TripId,
  TripTitle,
  UserId,
  Version,
} from '../../domain/value-objects';
import { Trip, TripRuleError } from '../../domain/trip';
import {
  StopRepository,
  StopRepositoryError,
  type StopRecord,
  type UpdateStopRecord,
} from '../../infrastructure/database/stop.repository';
import {
  TripIncompleteForPublicationError,
  TripRepository,
  TripVersionConflictError,
  type TripDetailRow,
  type TripListRow,
} from '../../infrastructure/database/trip.repository';
import {
  TripAuthorizationError,
  TripAuthorizationPolicy,
} from '../authorization/trip-authorization.policy';

export type TripApplicationErrorCode =
  | 'FORBIDDEN'
  | 'TRIP_NOT_FOUND'
  | 'TRIP_DATE_RANGE_INVALID'
  | 'TRIP_DATE_RANGE_TOO_LONG'
  | 'TRIP_VERSION_CONFLICT'
  | 'TRIP_INCOMPLETE_FOR_PUBLICATION'
  | 'DAY_NOT_FOUND'
  | 'STOP_NOT_FOUND'
  | 'STOP_ORDER_INVALID'
  | 'INVITATION_INVALID'
  | 'INVITATION_EXPIRED'
  | 'VALIDATION_FAILED';

export class TripApplicationError extends Error {
  constructor(
    readonly code: TripApplicationErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'TripApplicationError';
  }
}

export interface CreateTripCommand {
  readonly actorId: string;
  readonly title: string;
  readonly description?: string | null;
  readonly startDate: string;
  readonly endDate: string;
  readonly budgetAmount?: number;
  readonly currency?: string;
  readonly correlationId: string;
  readonly idempotencyKey?: string;
}

export interface UpdateTripCommand {
  readonly actorId: string;
  readonly tripId: string;
  readonly title: string;
  readonly description?: string | null;
  readonly startDate: string;
  readonly endDate: string;
  readonly budgetAmount: number;
  readonly currency: string;
  readonly expectedVersion: number;
}

export interface AddStopCommand {
  readonly actorId: string;
  readonly tripId: string;
  readonly dayId: string;
  readonly placeId: string;
  readonly name: string;
  readonly address: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly notes?: string;
  readonly idempotencyKey?: string;
}

export interface UpdateStopCommand extends UpdateStopRecord {
  readonly actorId: string;
  readonly tripId: string;
  readonly stopId: string;
}

export class TripUseCases {
  constructor(
    private readonly trips: TripRepository,
    private readonly stops: StopRepository,
    private readonly authorization: TripAuthorizationPolicy,
  ) {}

  async create(command: CreateTripCommand): Promise<TripDetailRow> {
    try {
      const actorId = UserId.from(command.actorId);
      const tripId = TripId.create(
        command.idempotencyKey
          ? idempotentUuid(command.actorId, 'trip', command.idempotencyKey)
          : undefined,
      );
      const trip = Trip.create({
        id: tripId,
        ownerId: actorId,
        title: TripTitle.from(command.title),
        description: normalizeDescription(command.description),
        dateRange: DateRange.from(command.startDate, command.endDate),
        budget: Money.from(
          command.budgetAmount ?? 0,
          Currency.from(command.currency ?? 'VND'),
        ),
        correlationId: command.correlationId,
      });
      const existing = await this.trips.getByIdForUser(
        tripId.value,
        actorId.value,
      );
      if (existing) return existing;
      await this.trips.create(trip);
      const created = await this.trips.getByIdForUser(
        tripId.value,
        actorId.value,
      );
      if (!created) {
        throw new TripApplicationError(
          'TRIP_NOT_FOUND',
          'Created trip is unavailable.',
        );
      }
      return created;
    } catch (error) {
      throw mapTripApplicationError(error);
    }
  }

  async list(actorId: string): Promise<readonly TripListRow[]> {
    try {
      return await this.trips.listForUser(UserId.from(actorId).value);
    } catch (error) {
      throw mapTripApplicationError(error);
    }
  }

  async listPublished() {
    return this.trips.listPublished();
  }

  async getPublished(tripId: string) {
    const trip = await this.trips.getPublished(tripId);
    if (!trip) throw new TripApplicationError('TRIP_NOT_FOUND', 'Trip does not exist.');
    return trip;
  }

  async clonePublished(
    actorId: string,
    sourceTripId: string,
    idempotencyKey?: string,
    correlationId?: string,
  ) {
    try {
      const ownerId = UserId.from(actorId).value;
      const id = TripId.create(
        idempotencyKey
          ? idempotentUuid(ownerId, `clone:${sourceTripId}`, idempotencyKey)
          : undefined,
      ).value;
      const trip = await this.trips.clonePublished(
        sourceTripId,
        ownerId,
        id,
        correlationId,
      );
      if (!trip)
        throw new TripApplicationError('TRIP_NOT_FOUND', 'Trip does not exist.');
      return trip;
    } catch (error) {
      throw mapTripApplicationError(error);
    }
  }

  async get(actorId: string, tripId: string): Promise<TripDetailRow> {
    try {
      await this.authorization.assertCanRead(tripId, actorId);
      const trip = await this.trips.getByIdForUser(tripId, actorId);
      if (!trip || trip.deletedAt)
        throw new TripApplicationError(
          'TRIP_NOT_FOUND',
          'Trip does not exist.',
        );
      return trip;
    } catch (error) {
      throw mapTripApplicationError(error);
    }
  }

  async update(command: UpdateTripCommand): Promise<Version> {
    try {
      await this.authorization.assertCanManageTrip(
        command.tripId,
        command.actorId,
      );
      // Validate the complete replacement before persistence. Day reconciliation is
      // intentionally deferred until the approved confirmation flow is implemented.
      TripTitle.from(command.title);
      DateRange.from(command.startDate, command.endDate);
      Money.from(command.budgetAmount, Currency.from(command.currency));
      return await this.trips.update(command.tripId, {
        title: command.title.trim(),
        description: normalizeDescription(command.description),
        startDate: command.startDate,
        endDate: command.endDate,
        budgetAmount: command.budgetAmount,
        currency: command.currency,
        expectedVersion: Version.from(command.expectedVersion),
      });
    } catch (error) {
      throw mapTripApplicationError(error);
    }
  }

  async softDelete(
    actorId: string,
    tripId: string,
    expectedVersion: number,
  ): Promise<Version> {
    try {
      await this.authorization.assertCanManageTrip(tripId, actorId);
      return await this.trips.softDelete(tripId, Version.from(expectedVersion));
    } catch (error) {
      throw mapTripApplicationError(error);
    }
  }

  async addStop(command: AddStopCommand): Promise<StopRecord> {
    try {
      await this.authorization.assertCanEditItinerary(
        command.tripId,
        command.actorId,
      );
      const notes = normalizeOptionalNotes(command.notes);
      return await this.stops.add({
        id: command.idempotencyKey
          ? idempotentUuid(
              command.actorId,
              `stop:${command.tripId}`,
              command.idempotencyKey,
            )
          : randomUUID(),
        tripId: command.tripId,
        dayId: command.dayId,
        placeId: command.placeId.trim(),
        name: command.name.trim(),
        address: command.address.trim(),
        latitude: command.latitude,
        longitude: command.longitude,
        ...(notes ? { notes } : {}),
      });
    } catch (error) {
      throw mapTripApplicationError(error);
    }
  }

  async updateStop(command: UpdateStopCommand): Promise<number> {
    try {
      await this.authorization.assertCanEditItinerary(
        command.tripId,
        command.actorId,
      );
      return await this.stops.update(command.tripId, command.stopId, {
        name: command.name.trim(),
        address: command.address.trim(),
        latitude: command.latitude,
        longitude: command.longitude,
        notes: normalizeNotes(command.notes),
        expectedVersion: command.expectedVersion,
      });
    } catch (error) {
      throw mapTripApplicationError(error);
    }
  }

  async removeStop(
    actorId: string,
    tripId: string,
    stopId: string,
  ): Promise<void> {
    try {
      await this.authorization.assertCanEditItinerary(tripId, actorId);
      await this.stops.remove(tripId, stopId);
    } catch (error) {
      throw mapTripApplicationError(error);
    }
  }

  async reorderStops(
    actorId: string,
    tripId: string,
    dayId: string,
    orderedStopIds: readonly string[],
    expectedVersion?: number,
  ): Promise<void> {
    try {
      await this.authorization.assertCanEditItinerary(tripId, actorId);
      await this.stops.reorder(tripId, dayId, orderedStopIds, expectedVersion);
    } catch (error) {
      throw mapTripApplicationError(error);
    }
  }

  async moveStop(
    actorId: string,
    tripId: string,
    stopId: string,
    targetDayId: string,
    targetIndex: number,
    expectedVersion?: number,
  ): Promise<void> {
    try {
      await this.authorization.assertCanEditItinerary(tripId, actorId);
      await this.stops.move(
        tripId,
        stopId,
        targetDayId,
        targetIndex,
        expectedVersion,
      );
    } catch (error) {
      throw mapTripApplicationError(error);
    }
  }

  async updateVisibility(
    actorId: string,
    tripId: string,
    visibility: 'PRIVATE' | 'UNLISTED' | 'PUBLISHED',
    correlationId?: string,
  ): Promise<{ visibility: string; publishedAt: string | null; version: number }> {
    try {
      await this.authorization.assertCanManageTrip(tripId, actorId);
      return await this.trips.updateVisibility(
        tripId,
        actorId,
        visibility,
        correlationId,
      );
    } catch (error) {
      throw mapTripApplicationError(error);
    }
  }

  async updateStatus(
    actorId: string,
    tripId: string,
    status: 'PLANNING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED',
  ): Promise<{ status: string; version: number }> {
    try {
      await this.authorization.assertCanManageTrip(tripId, actorId);
      return await this.trips.updateStatus(tripId, status, actorId);
    } catch (error) {
      throw mapTripApplicationError(error);
    }
  }

  async getMemory(actorId: string, tripId: string) {
    try {
      await this.authorization.assertCanRead(tripId, actorId);
      const memory = await this.trips.getMemory(tripId);
      if (!memory) {
        // Auto-initialize if trip exists and user can read
        const trip = await this.trips.getByIdForUser(tripId, actorId);
        if (!trip) throw new TripApplicationError('TRIP_NOT_FOUND', 'Trip does not exist.');
        return await this.trips.updateMemory(tripId, {
          title: trip.title,
          summary: trip.description,
          visibility: 'PRIVATE',
        });
      }
      return memory;
    } catch (error) {
      throw mapTripApplicationError(error);
    }
  }

  async updateMemory(
    actorId: string,
    tripId: string,
    data: { title: string; summary: string | null; visibility: 'PRIVATE' | 'UNLISTED' | 'PUBLISHED'; coverPhotoUrl?: string | null },
  ) {
    try {
      await this.authorization.assertCanManageTrip(tripId, actorId);
      return await this.trips.updateMemory(tripId, data);
    } catch (error) {
      throw mapTripApplicationError(error);
    }
  }

  async addMemoryPhoto(
    actorId: string,
    tripId: string,
    photo: { photoUrl: string; caption?: string | null },
  ) {
    try {
      await this.authorization.assertCanEditItinerary(tripId, actorId);
      const memory = await this.getMemory(actorId, tripId);
      return await this.trips.addMemoryPhoto(memory.id, photo);
    } catch (error) {
      throw mapTripApplicationError(error);
    }
  }

  async listExpenses(actorId: string, tripId: string) {
    try {
      await this.authorization.assertCanRead(tripId, actorId);
      return await this.trips.listExpenses(tripId);
    } catch (error) {
      throw mapTripApplicationError(error);
    }
  }

  async addExpense(
    actorId: string,
    tripId: string,
    expense: { amount: number; currency?: string; category: string; description: string },
  ) {
    try {
      await this.authorization.assertCanEditItinerary(tripId, actorId);
      return await this.trips.addExpense(tripId, actorId, expense);
    } catch (error) {
      throw mapTripApplicationError(error);
    }
  }

  async deleteExpense(actorId: string, tripId: string, expenseId: string) {
    try {
      await this.authorization.assertCanEditItinerary(tripId, actorId);
      await this.trips.deleteExpense(tripId, expenseId);
    } catch (error) {
      throw mapTripApplicationError(error);
    }
  }

  async updateLiveLocation(
    actorId: string,
    tripId: string,
    data: { latitude: number; longitude: number; sharingActive?: boolean; consentGiven?: boolean },
  ) {
    try {
      await this.authorization.assertCanRead(tripId, actorId);
      return await this.trips.updateLiveLocation(tripId, actorId, data);
    } catch (error) {
      throw mapTripApplicationError(error);
    }
  }

  async listActiveLiveLocations(actorId: string, tripId: string) {
    try {
      await this.authorization.assertCanRead(tripId, actorId);
      return await this.trips.listActiveLiveLocations(tripId);
    } catch (error) {
      throw mapTripApplicationError(error);
    }
  }
}

function normalizeDescription(value: string | null | undefined): string | null {
  const normalized = value?.trim();
  return normalized || null;
}
function normalizeNotes(value: string | null | undefined): string | null {
  return value?.trim() || null;
}
function normalizeOptionalNotes(value: string | undefined): string | undefined {
  return value?.trim() || undefined;
}
function idempotentUuid(actorId: string, scope: string, key: string): string {
  if (!key.trim())
    throw new TripApplicationError(
      'VALIDATION_FAILED',
      'Idempotency key cannot be empty.',
    );
  const bytes = createHash('sha256')
    .update(`${actorId}:${scope}:${key}`)
    .digest()
    .subarray(0, 16);
  bytes[6] = (bytes[6]! & 0x0f) | 0x50;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  return `${bytes.toString('hex', 0, 4)}-${bytes.toString('hex', 4, 6)}-${bytes.toString('hex', 6, 8)}-${bytes.toString('hex', 8, 10)}-${bytes.toString('hex', 10, 16)}`;
}

export function mapTripApplicationError(error: unknown): TripApplicationError {
  if (error instanceof TripApplicationError) return error;
  if (error instanceof TripAuthorizationError)
    return new TripApplicationError(error.code, error.message);
  if (error instanceof TripVersionConflictError)
    return new TripApplicationError('TRIP_VERSION_CONFLICT', error.message);
  if (error instanceof TripIncompleteForPublicationError)
    return new TripApplicationError(
      'TRIP_INCOMPLETE_FOR_PUBLICATION',
      error.message,
    );
  if (error instanceof StopRepositoryError) {
    const code: TripApplicationErrorCode =
      error.code === 'STOP_DAY_MISMATCH'
        ? 'DAY_NOT_FOUND'
        : error.code === 'STOP_VERSION_CONFLICT'
          ? 'TRIP_VERSION_CONFLICT'
          : error.code;
    return new TripApplicationError(code, error.message);
  }
  if (error instanceof DomainValidationError) {
    const code =
      error.code === 'TRIP_DATE_RANGE_INVALID' ||
      error.code === 'TRIP_DATE_RANGE_TOO_LONG'
        ? error.code
        : 'VALIDATION_FAILED';
    return new TripApplicationError(code, error.message);
  }
  if (error instanceof TripRuleError) {
    const codes: Record<string, TripApplicationErrorCode> = {
      TRIP_PERMISSION_DENIED: 'FORBIDDEN',
      TRIP_DAY_NOT_FOUND: 'DAY_NOT_FOUND',
      TRIP_STOP_NOT_FOUND: 'STOP_NOT_FOUND',
      TRIP_STOP_ORDER_INVALID: 'STOP_ORDER_INVALID',
    };
    return new TripApplicationError(
      codes[error.code] ?? 'VALIDATION_FAILED',
      error.message,
    );
  }
  return new TripApplicationError(
    'VALIDATION_FAILED',
    'The trip command is invalid.',
  );
}
