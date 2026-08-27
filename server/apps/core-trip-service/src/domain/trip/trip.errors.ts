export type TripRuleCode =
  | 'TRIP_PERMISSION_DENIED'
  | 'TRIP_STATE_TRANSITION_INVALID'
  | 'TRIP_MEMBER_DUPLICATE';

export class TripRuleError extends Error {
  constructor(
    readonly code: TripRuleCode,
    message: string,
  ) {
    super(message);
    this.name = 'TripRuleError';
  }
}
