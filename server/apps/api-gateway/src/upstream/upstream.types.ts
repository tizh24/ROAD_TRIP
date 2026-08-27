import type { ErrorCode } from '@roadtrip/contracts';

export interface UpstreamRequest {
  method: string;
  path: string;
  headers: Readonly<Record<string, string>>;
  body?: unknown;
}

export interface UpstreamResponse {
  status: number;
  body: unknown;
}

export interface UpstreamClient {
  request(request: UpstreamRequest): Promise<UpstreamResponse>;
}

export interface UpstreamUnavailableError {
  code: ErrorCode;
  message: string;
}

export const CORE_TRIP_UPSTREAM = Symbol('CORE_TRIP_UPSTREAM');
export const GEO_LOCATION_UPSTREAM = Symbol('GEO_LOCATION_UPSTREAM');
