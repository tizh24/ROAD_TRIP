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
  getVersion(): Version {
    return this.version;
  }
  getDays(): readonly TripDay[] {
    return [...this.days];
  }
  getMembers(): readonly TripMember[] {
    return [...this.members];
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
  private bumpVersion(): void {
    this.version = this.version.next();
  }
}

function createDays(range: DateRange): TripDay[] {
  const start = new Date(`${range.startDate}T00:00:00.000Z`);
  return Array.from({ length: range.totalDays }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    return { date: date.toISOString().slice(0, 10), dayIndex: index + 1 };
  });
}
