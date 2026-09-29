import { redact } from './redaction';

export interface NormalizedError {
  error: {
    name: string;
    message: string;
    stack?: string;
    cause?: unknown;
  };
}

export function normalizeError(error: unknown): NormalizedError {
  if (error instanceof Error) {
    return {
      error: {
        name: error.name,
        message: error.message,
        ...(error.stack ? { stack: error.stack } : {}),
        ...('cause' in error && error.cause !== undefined
          ? { cause: redact(error.cause) }
          : {}),
      },
    };
  }
  return { error: { name: 'UnknownError', message: 'Unknown error' } };
}
