import { randomUUID } from 'node:crypto';
import {
  type DateRange,
  type Money,
  type TripId,
  type TripTitle,
  type UserId,
  Version,
} from '../value-objects';
import { TripRuleError } from './trip.errors';

export type TripStatus =
  'PLANNING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' | 'DELETED';
export type TripPermission = 'VIEW' | 'EDIT';

export interface TripDay {
  readonly date: string;
  readonly dayIndex: number;
}

export interface TripCreatedDomainEvent {
  readonly type: 'TripCreated';
  readonly eventId: string;
  readonly aggregateId: TripId;
  readonly occurredAt: Date;
  readonly correlationId: string;
  readonly payload: {
    readonly tripId: TripId;
    readonly ownerId: UserId;
    readonly title: TripTitle;
    readonly dateRange: DateRange;
    readonly dayCount: number;
  };
}

export interface CreateTripInput {
  readonly id: TripId;
  readonly ownerId: UserId;
  readonly title: TripTitle;
  readonly dateRange: DateRange;
  readonly budget: Money;
  readonly correlationId: string;
  readonly createdAt?: Date;
}

export interface TripMember {
  readonly userId: UserId;
  readonly role: 'OWNER' | 'MEMBER';
  readonly permission: TripPermission;
}

export interface TripStop {
  readonly id: string;
  readonly dayIndex: number;
  readonly stopIndex: number;
  readonly placeId: string;
  readonly name: string;
  readonly address: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly notes?: string;
}

export interface AddTripStopInput {
  readonly id: string;
  readonly dayIndex: number;
  readonly placeId: string;
  readonly name: string;
  readonly address: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly notes?: string;
}

const transitions: Readonly<Record<TripStatus, readonly TripStatus[]>> = {
  PLANNING: ['ONGOING', 'CANCELLED', 'DELETED'],
  ONGOING: ['COMPLETED', 'CANCELLED', 'DELETED'],
  COMPLETED: ['DELETED'],
  CANCELLED: ['DELETED'],
  DELETED: [],
};

export class Trip {
  private status: TripStatus = 'PLANNING';
  private version = Version.from(1);
  private readonly members: TripMember[];
  private readonly days: TripDay[];
  private readonly events: TripCreatedDomainEvent[];
  private stops: TripStop[] = [];

  private constructor(private readonly input: CreateTripInput) {
    this.members = [
      { userId: input.ownerId, role: 'OWNER', permission: 'EDIT' },
    ];
    this.days = createDays(input.dateRange);
    this.events = [
      {
        type: 'TripCreated',
        eventId: randomUUID(),
        aggregateId: input.id,
        occurredAt: input.createdAt ?? new Date(),
        correlationId: input.correlationId,
        payload: {
          tripId: input.id,
          ownerId: input.ownerId,
          title: input.title,
          dateRange: input.dateRange,
          dayCount: this.days.length,
        },
      },
    ];
  }

  static create(input: CreateTripInput): Trip {
    if (!input.correlationId.trim()) {
      throw new TripRuleError(
        'TRIP_STATE_TRANSITION_INVALID',
        'Correlation ID is required.',
      );
    }
    return new Trip(input);
  }

  getStatus(): TripStatus {
    return this.status;
  }
  getId(): TripId {
    return this.input.id;
  }
  getOwnerId(): UserId {
    return this.input.ownerId;
  }
  getTitle(): TripTitle {
    return this.input.title;
  }
  getDateRange(): DateRange {
    return this.input.dateRange;
  }
  getBudget(): Money {
    return this.input.budget;
  }
  getVersion(): Version {
    return this.version;
  }
  getDays(): readonly TripDay[] {
    return [...this.days];
  }
  getMembers(): readonly TripMember[] {
    return [...this.members];
  }
  getStops(dayIndex?: number): readonly TripStop[] {
    return this.stops
      .filter((stop) => dayIndex === undefined || stop.dayIndex === dayIndex)
      .sort((left, right) => left.stopIndex - right.stopIndex);
  }
  canView(userId: UserId): boolean {
    return this.memberFor(userId) !== undefined;
  }
  canEdit(userId: UserId): boolean {
    return this.memberFor(userId)?.permission === 'EDIT';
  }
  canManageMembers(userId: UserId): boolean {
    return this.memberFor(userId)?.role === 'OWNER';
  }

  addMember(actorId: UserId, userId: UserId, permission: TripPermission): void {
    this.assertOwner(actorId);
    if (this.memberFor(userId)) {
      throw new TripRuleError(
        'TRIP_MEMBER_DUPLICATE',
        'Trip member already exists.',
      );
    }
    this.members.push({ userId, role: 'MEMBER', permission });
    this.bumpVersion();
  }

  transition(actorId: UserId, next: TripStatus): void {
    this.assertOwner(actorId);
    if (!transitions[this.status].includes(next)) {
      throw new TripRuleError(
        'TRIP_STATE_TRANSITION_INVALID',
        `Cannot transition ${this.status} to ${next}.`,
      );
    }
    this.status = next;
    this.bumpVersion();
  }

  addStop(actorId: UserId, input: AddTripStopInput): void {
    this.assertItineraryEditor(actorId);
    this.assertDay(input.dayIndex);
    validateStopInput(input);
    const dayStops = this.getStops(input.dayIndex);
    const { notes, ...snapshot } = input;
    const normalizedNotes = normalizeNotes(notes);
    this.stops.push({
      ...snapshot,
      stopIndex: dayStops.length + 1,
      ...(normalizedNotes ? { notes: normalizedNotes } : {}),
    });
    this.bumpVersion();
  }

  updateStop(actorId: UserId, stopId: string, notes: string | undefined): void {
    this.assertItineraryEditor(actorId);
    const stop = this.stopFor(stopId);
    this.stops = this.stops.map((candidate) =>
      candidate.id === stop.id ? replaceNotes(candidate, notes) : candidate,
    );
    this.bumpVersion();
  }

  removeStop(actorId: UserId, stopId: string): void {
    this.assertItineraryEditor(actorId);
    const stop = this.stopFor(stopId);
    this.stops = this.stops.filter((candidate) => candidate.id !== stop.id);
    this.reindexDay(stop.dayIndex);
    this.bumpVersion();
  }

  reorderStops(
    actorId: UserId,
    dayIndex: number,
    orderedStopIds: readonly string[],
  ): void {
    this.assertItineraryEditor(actorId);
    this.assertDay(dayIndex);
    const current = this.getStops(dayIndex);
    if (
      current.length !== orderedStopIds.length ||
      new Set(orderedStopIds).size !== orderedStopIds.length ||
      !orderedStopIds.every((id) => current.some((stop) => stop.id === id))
    ) {
      throw new TripRuleError(
        'TRIP_STOP_ORDER_INVALID',
        'Stop order must contain every stop exactly once.',
      );
    }
    const positions = new Map(
      orderedStopIds.map((id, index) => [id, index + 1]),
    );
    this.stops = this.stops.map((stop) =>
      stop.dayIndex === dayIndex
        ? { ...stop, stopIndex: positions.get(stop.id)! }
        : stop,
    );
    this.bumpVersion();
  }

  moveStop(
    actorId: UserId,
    stopId: string,
    targetDayIndex: number,
    targetIndex?: number,
  ): void {
    this.assertItineraryEditor(actorId);
    this.assertDay(targetDayIndex);
    const stop = this.stopFor(stopId);
    const targetStops = this.getStops(targetDayIndex).filter(
      (candidate) => candidate.id !== stop.id,
    );
    const insertionIndex = targetIndex ?? targetStops.length + 1;
    if (
      !Number.isInteger(insertionIndex) ||
      insertionIndex < 1 ||
      insertionIndex > targetStops.length + 1
    ) {
      throw new TripRuleError(
        'TRIP_STOP_ORDER_INVALID',
        'Target stop index is invalid.',
      );
    }
    targetStops.splice(insertionIndex - 1, 0, {
      ...stop,
      dayIndex: targetDayIndex,
      stopIndex: insertionIndex,
    });
    this.stops = this.stops.filter(
      (candidate) =>
        candidate.id !== stop.id && candidate.dayIndex !== targetDayIndex,
    );
    this.stops.push(...targetStops);
    this.reindexDay(stop.dayIndex);
    this.reindexDay(targetDayIndex);
    this.bumpVersion();
  }

  pullDomainEvents(): readonly TripCreatedDomainEvent[] {
    return this.events.splice(0);
  }

  private memberFor(userId: UserId): TripMember | undefined {
    return this.members.find((member) => member.userId.equals(userId));
  }
  private assertOwner(userId: UserId): void {
    if (!this.canManageMembers(userId)) {
      throw new TripRuleError(
        'TRIP_PERMISSION_DENIED',
        'Only the owner can perform this action.',
      );
    }
  }
  private assertItineraryEditor(userId: UserId): void {
    if (!this.canEdit(userId)) {
      throw new TripRuleError(
        'TRIP_PERMISSION_DENIED',
        'An editor permission is required.',
      );
    }
    if (!['PLANNING', 'ONGOING'].includes(this.status)) {
      throw new TripRuleError(
        'TRIP_STATE_TRANSITION_INVALID',
        'Stops cannot change in this trip state.',
      );
    }
  }
  private assertDay(dayIndex: number): void {
    if (
      !Number.isInteger(dayIndex) ||
      !this.days.some((day) => day.dayIndex === dayIndex)
    ) {
      throw new TripRuleError('TRIP_DAY_NOT_FOUND', 'Trip day does not exist.');
    }
  }
  private stopFor(stopId: string): TripStop {
    const stop = this.stops.find((candidate) => candidate.id === stopId);
    if (!stop)
      throw new TripRuleError(
        'TRIP_STOP_NOT_FOUND',
        'Trip stop does not exist.',
      );
    return stop;
  }
  private reindexDay(dayIndex: number): void {
    const positions = new Map(
      this.getStops(dayIndex).map((stop, index) => [stop.id, index + 1]),
    );
    this.stops = this.stops.map((stop) =>
      stop.dayIndex === dayIndex
        ? { ...stop, stopIndex: positions.get(stop.id)! }
        : stop,
    );
  }
  private bumpVersion(): void {
    this.version = this.version.next();
  }
}

function validateStopInput(input: AddTripStopInput): void {
  if (
    !input.id ||
    !input.placeId.trim() ||
    !input.name.trim() ||
    !input.address.trim() ||
    !Number.isFinite(input.latitude) ||
    input.latitude < -90 ||
    input.latitude > 90 ||
    !Number.isFinite(input.longitude) ||
    input.longitude < -180 ||
    input.longitude > 180
  ) {
    throw new TripRuleError('TRIP_STOP_ORDER_INVALID', 'Stop data is invalid.');
  }
}

function normalizeNotes(notes: string | undefined): string | undefined {
  const normalized = notes?.trim();
  return normalized || undefined;
}

function replaceNotes(stop: TripStop, notes: string | undefined): TripStop {
  const withoutNotes: Omit<TripStop, 'notes'> = {
    id: stop.id,
    dayIndex: stop.dayIndex,
    stopIndex: stop.stopIndex,
    placeId: stop.placeId,
    name: stop.name,
    address: stop.address,
    latitude: stop.latitude,
    longitude: stop.longitude,
  };
  const normalizedNotes = normalizeNotes(notes);
  return normalizedNotes
    ? { ...withoutNotes, notes: normalizedNotes }
    : withoutNotes;
}

function createDays(range: DateRange): TripDay[] {
  const start = new Date(`${range.startDate}T00:00:00.000Z`);
  return Array.from({ length: range.totalDays }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    return { date: date.toISOString().slice(0, 10), dayIndex: index + 1 };
  });
}
