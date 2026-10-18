import {
  ForbiddenException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import type { ErrorCode, ErrorResponse } from '@roadtrip/contracts';
import {
  CORRELATION_ID_HEADER,
  getCorrelationId,
  normalizeCorrelationId,
} from '@roadtrip/observability';

type AuthErrorCode = Extract<
  ErrorCode,
  'AUTH_REQUIRED' | 'AUTH_INVALID' | 'AUTH_UNAVAILABLE' | 'ACCOUNT_INACTIVE'
>;

const messages: Record<AuthErrorCode, string> = {
  AUTH_REQUIRED: 'Authentication is required.',
  AUTH_INVALID: 'Authentication token is invalid or expired.',
  AUTH_UNAVAILABLE: 'Authentication service is temporarily unavailable.',
  ACCOUNT_INACTIVE: 'This account is not active.',
};

export function authError(
  code: AuthErrorCode,
  headers: Readonly<Record<string, string | string[] | undefined>>,
) {
  const body: ErrorResponse = {
    error: { code, message: messages[code] },
    meta: {
      correlationId:
        getCorrelationId() ??
        normalizeCorrelationId(headers[CORRELATION_ID_HEADER]),
    },
  };

  return code === 'ACCOUNT_INACTIVE'
    ? new ForbiddenException(body)
    : code === 'AUTH_UNAVAILABLE'
      ? new ServiceUnavailableException(body)
    : new UnauthorizedException(body);
}
