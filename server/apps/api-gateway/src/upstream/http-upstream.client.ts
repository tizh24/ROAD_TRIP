import { Injectable } from '@nestjs/common';
import { errorResponseSchema } from '@roadtrip/contracts';
import type { GatewayConfig } from '@roadtrip/config';
import type {
  UpstreamClient,
  UpstreamRequest,
  UpstreamResponse,
} from './upstream.types';

export class UpstreamUnavailableException extends Error {
  constructor(message = 'The upstream service is temporarily unavailable.') {
    super(message);
    this.name = 'UpstreamUnavailableException';
  }
}

@Injectable()
export class HttpUpstreamClient implements UpstreamClient {
  constructor(
    private readonly baseUrl: string,
    private readonly timeoutMs: number,
    private readonly internalServiceToken: string,
  ) {}

  async request(request: UpstreamRequest): Promise<UpstreamResponse> {
    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), this.timeoutMs);
    try {
      const response = await fetch(new URL(request.path, this.baseUrl), {
        method: request.method,
        headers: {
          ...request.headers,
          'x-roadtrip-internal-token': this.internalServiceToken,
          ...(request.body === undefined
            ? {}
            : { 'content-type': 'application/json' }),
        },
        ...(request.body === undefined
          ? {}
          : { body: JSON.stringify(request.body) }),
        signal: abortController.signal,
      });
      const body = await parseResponseBody(response);
      if (response.status >= 500) {
        const error = errorResponseSchema.safeParse(body);
        if (!error.success) throw new UpstreamUnavailableException();
      }
      return { status: response.status, body };
    } catch (error) {
      if (error instanceof UpstreamUnavailableException) throw error;
      throw new UpstreamUnavailableException();
    } finally {
      clearTimeout(timeout);
    }
  }
}

export function createCoreTripUpstream(config: GatewayConfig): UpstreamClient {
  return new HttpUpstreamClient(
    config.CORE_TRIP_SERVICE_URL,
    config.UPSTREAM_TIMEOUT_MS,
    config.INTERNAL_SERVICE_TOKEN,
  );
}

export function createGeoLocationUpstream(
  config: GatewayConfig,
): UpstreamClient {
  return new HttpUpstreamClient(
    config.GEO_LOCATION_SERVICE_URL,
    config.UPSTREAM_TIMEOUT_MS,
    config.INTERNAL_SERVICE_TOKEN,
  );
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) return undefined;
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}
