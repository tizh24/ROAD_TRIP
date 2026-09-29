export interface IntegrationEvent {
  readonly eventId: string;
  readonly eventType: string;
  readonly eventVersion: number;
  readonly occurredAt: string;
  readonly correlationId: string;
  readonly producer: string;
  readonly aggregateId: string;
  readonly payload: unknown;
}

export interface EventPublisher {
  publish(event: IntegrationEvent): Promise<void>;
}

export const EVENT_PUBLISHER = Symbol('EVENT_PUBLISHER');
