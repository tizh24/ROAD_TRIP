export type TripAccessLevel = 'OWNER' | 'EDITOR' | 'VIEWER' | 'OUTSIDER';
export type TripAction =
  'READ' | 'EDIT_ITINERARY' | 'MANAGE_TRIP' | 'MANAGE_MEMBERS';

export interface TripAccessRecord {
  readonly tripExists: boolean;
  readonly ownerId: string;
  readonly membership?: {
    readonly role: 'OWNER' | 'MEMBER';
    readonly permission: 'VIEW' | 'EDIT';
    readonly status: 'ACTIVE' | 'LEFT' | 'REMOVED';
  };
}

export interface TripAccessReader {
  getAccessRecord(tripId: string, userId: string): Promise<TripAccessRecord>;
}

export class TripAuthorizationError extends Error {
  constructor(readonly code: 'TRIP_NOT_FOUND' | 'FORBIDDEN') {
    super(
      code === 'TRIP_NOT_FOUND'
        ? 'Trip does not exist.'
        : 'Trip access is forbidden.',
    );
    this.name = 'TripAuthorizationError';
  }
}

export class TripAuthorizationPolicy {
  constructor(private readonly reader: TripAccessReader) {}

  async assertAllowed(
    tripId: string,
    userId: string,
    action: TripAction,
  ): Promise<TripAccessLevel> {
    const record = await this.reader.getAccessRecord(tripId, userId);
    if (!record.tripExists) throw new TripAuthorizationError('TRIP_NOT_FOUND');
    const level = resolveAccessLevel(record, userId);
    if (!allows(level, action)) throw new TripAuthorizationError('FORBIDDEN');
    return level;
  }

  assertCanRead(tripId: string, userId: string) {
    return this.assertAllowed(tripId, userId, 'READ');
  }
  assertCanEditItinerary(tripId: string, userId: string) {
    return this.assertAllowed(tripId, userId, 'EDIT_ITINERARY');
  }
  assertCanManageTrip(tripId: string, userId: string) {
    return this.assertAllowed(tripId, userId, 'MANAGE_TRIP');
  }
  assertCanManageMembers(tripId: string, userId: string) {
    return this.assertAllowed(tripId, userId, 'MANAGE_MEMBERS');
  }
}

export function resolveAccessLevel(
  record: TripAccessRecord,
  userId: string,
): TripAccessLevel {
  if (!record.tripExists) return 'OUTSIDER';
  if (record.ownerId === userId) return 'OWNER';
  if (record.membership?.status !== 'ACTIVE') return 'OUTSIDER';
  return record.membership.permission === 'EDIT' ? 'EDITOR' : 'VIEWER';
}

function allows(level: TripAccessLevel, action: TripAction): boolean {
  if (level === 'OWNER') return true;
  if (level === 'EDITOR')
    return action === 'READ' || action === 'EDIT_ITINERARY';
  return level === 'VIEWER' && action === 'READ';
}
