import type { Coordinate, Place, VehicleMode } from '@roadtrip/contracts';

export type VietMapErrorCode =
  'PLACE_PROVIDER_UNAVAILABLE' | 'ROUTE_UNAVAILABLE';

export class VietMapError extends Error {
  constructor(
    readonly code: VietMapErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'VietMapError';
  }
}

export interface VietMapRoute {
  readonly geometry: {
    readonly type: 'LineString';
    readonly coordinates: readonly [number, number][];
  };
  readonly distanceMeters: number;
  readonly durationSeconds: number;
}

export interface VietMapAdapterOptions {
  readonly baseUrl: string;
  readonly apiKey: string;
  readonly timeoutMs: number;
  readonly fetch?: typeof fetch;
  readonly now?: () => number;
}

export class VietMapAdapter {
  private consecutiveFailures = 0;
  private openUntil = 0;
  private readonly fetch: typeof fetch;
  private readonly now: () => number;

  constructor(private readonly options: VietMapAdapterOptions) {
    this.fetch = options.fetch ?? fetch;
    this.now = options.now ?? Date.now;
  }

  async searchPlaces(query: string): Promise<readonly Place[]> {
    return this.execute('PLACE_PROVIDER_UNAVAILABLE', async () => {
      const search = await this.getJson('/api/search/v3', { text: query });
      if (!Array.isArray(search)) throw malformed('PLACE_PROVIDER_UNAVAILABLE');
      const results = await Promise.all(
        search.slice(0, 20).map(async (item) => {
          const result = searchResult(item);
          const detail = await this.getJson('/api/place/v3', {
            refid: result.id,
          });
          const coordinate = placeCoordinate(detail);
          return {
            id: result.id,
            name: result.name,
            address: result.address,
            coordinate,
          };
        }),
      );
      return results;
    });
  }

  async previewRoute(
    coordinates: readonly Coordinate[],
    vehicle: VehicleMode,
  ): Promise<VietMapRoute> {
    return this.execute('ROUTE_UNAVAILABLE', async () => {
      const route = await this.getJson('/api/route/v3', {
        point: coordinates.map(
          ({ latitude, longitude }) => `${latitude},${longitude}`,
        ),
        vehicle,
        points_encoded: 'false',
      });
      return routeResult(route);
    });
  }

  private async getJson(
    path: string,
    query: Record<string, string | readonly string[]>,
  ): Promise<unknown> {
    const url = new URL(path, this.options.baseUrl);
    url.searchParams.set('apikey', this.options.apiKey);
    for (const [key, value] of Object.entries(query)) {
      if (typeof value === 'string') url.searchParams.set(key, value);
      else value.forEach((entry) => url.searchParams.append(key, entry));
    }
    return this.withRetry(async () => {
      const controller = new AbortController();
      const timer = setTimeout(
        () => controller.abort(),
        this.options.timeoutMs,
      );
      try {
        const response = await this.fetch(url, { signal: controller.signal });
        if (!response.ok) {
          const retryable =
            response.status === 408 ||
            response.status === 429 ||
            response.status >= 500;
          throw new ProviderHttpError(retryable);
        }
        return await response.json();
      } finally {
        clearTimeout(timer);
      }
    });
  }

  private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: unknown;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        if (
          !(error instanceof ProviderHttpError && error.retryable) ||
          attempt === 1
        )
          throw error;
      }
    }
    throw lastError;
  }

  private async execute<T>(
    code: VietMapErrorCode,
    operation: () => Promise<T>,
  ): Promise<T> {
    if (this.now() < this.openUntil)
      throw new VietMapError(
        code,
        'Location provider is temporarily unavailable.',
      );
    try {
      const result = await operation();
      this.consecutiveFailures = 0;
      return result;
    } catch {
      this.consecutiveFailures += 1;
      if (this.consecutiveFailures >= 3) this.openUntil = this.now() + 30_000;
      throw new VietMapError(
        code,
        'Location provider is temporarily unavailable.',
      );
    }
  }
}

class ProviderHttpError extends Error {
  constructor(readonly retryable: boolean) {
    super('Provider request failed.');
  }
}

function searchResult(value: unknown): {
  id: string;
  name: string;
  address: string;
} {
  if (
    !isObject(value) ||
    !isString(value.ref_id) ||
    !isString(value.name) ||
    !isString(value.address)
  )
    throw malformed('PLACE_PROVIDER_UNAVAILABLE');
  return { id: value.ref_id, name: value.name, address: value.address };
}
function placeCoordinate(value: unknown): Coordinate {
  if (
    !isObject(value) ||
    !isNumber(value.lat) ||
    !isNumber(value.lng) ||
    value.lat < -90 ||
    value.lat > 90 ||
    value.lng < -180 ||
    value.lng > 180
  )
    throw malformed('PLACE_PROVIDER_UNAVAILABLE');
  return { latitude: value.lat, longitude: value.lng };
}
function routeResult(value: unknown): VietMapRoute {
  if (
    !isObject(value) ||
    !Array.isArray(value.paths) ||
    !value.paths[0] ||
    !isObject(value.paths[0])
  )
    throw malformed('ROUTE_UNAVAILABLE');
  const path = value.paths[0];
  if (
    !isNumber(path.distance) ||
    !isNumber(path.time) ||
    !Array.isArray(path.points)
  )
    throw malformed('ROUTE_UNAVAILABLE');
  const coordinates = path.points.map((point) => {
    if (
      !Array.isArray(point) ||
      point.length !== 2 ||
      !isNumber(point[0]) ||
      !isNumber(point[1])
    )
      throw malformed('ROUTE_UNAVAILABLE');
    return [point[1], point[0]] as [number, number];
  });
  if (coordinates.length < 2) throw malformed('ROUTE_UNAVAILABLE');
  return {
    geometry: { type: 'LineString', coordinates },
    distanceMeters: path.distance,
    durationSeconds: path.time / 1_000,
  };
}
function malformed(code: VietMapErrorCode): VietMapError {
  return new VietMapError(code, 'Location provider response is invalid.');
}
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
function isString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}
