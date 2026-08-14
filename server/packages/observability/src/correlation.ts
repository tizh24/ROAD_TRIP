import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';

export const CORRELATION_ID_HEADER = 'x-correlation-id';
const correlationIdPattern = /^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$/;
const correlationStorage = new AsyncLocalStorage<{ correlationId: string }>();

export function normalizeCorrelationId(value: unknown): string {
  const candidate: unknown = Array.isArray(value)
    ? (value as unknown[])[0]
    : value;
  return typeof candidate === 'string' && correlationIdPattern.test(candidate)
    ? candidate
    : randomUUID();
}

export function runWithCorrelationId<T>(
  correlationId: string,
  callback: () => T,
): T {
  return correlationStorage.run({ correlationId }, callback);
}

export function getCorrelationId(): string | undefined {
  return correlationStorage.getStore()?.correlationId;
}

export function correlationHeaders(
  headers: Readonly<Record<string, string>> = {},
): Record<string, string> {
  const correlationId = getCorrelationId();
  return correlationId
    ? { ...headers, [CORRELATION_ID_HEADER]: correlationId }
    : { ...headers };
}

export interface CorrelationRequest {
  headers: Record<string, string | string[] | undefined>;
}

export interface CorrelationResponse {
  setHeader(name: string, value: string): void;
}

export type NextFunction = () => void;

export function correlationIdMiddleware() {
  return (
    request: CorrelationRequest,
    response: CorrelationResponse,
    next: NextFunction,
  ): void => {
    const correlationId = normalizeCorrelationId(
      request.headers[CORRELATION_ID_HEADER],
    );
    response.setHeader(CORRELATION_ID_HEADER, correlationId);
    runWithCorrelationId(correlationId, next);
  };
}
