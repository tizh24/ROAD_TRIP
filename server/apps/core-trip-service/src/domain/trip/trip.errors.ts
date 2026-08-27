export type TripRuleCode =
  | 'TRIP_PERMISSION_DENIED'
  | 'TRIP_STATE_TRANSITION_INVALID'
  | 'TRIP_MEMBER_DUPLICATE'
  | 'TRIP_DAY_NOT_FOUND'
  | 'TRIP_STOP_NOT_FOUND'
  | 'TRIP_STOP_ORDER_INVALID';

export class TripRuleError extends Error {
  constructor(
    readonly code: TripRuleCode,
    message: string,
  ) {
    super(message);
    this.name = 'TripRuleError';
  }
}
