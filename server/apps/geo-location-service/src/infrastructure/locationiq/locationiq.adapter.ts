import type { Coordinate, Place, VehicleMode } from '@roadtrip/contracts';
import {
  GeoProviderError,
  type GeoProvider,
  type GeoProviderErrorCode,
  type RoutePreview,
} from '../../application/geo-provider.port';

export interface LocationIqAdapterOptions {
  readonly baseUrl: string;
  readonly apiKey: string;
  readonly timeoutMs: number;
  readonly fetch?: typeof fetch;
  readonly now?: () => number;
}

export class LocationIqAdapter implements GeoProvider {
  private consecutiveFailures = 0;
  private openUntil = 0;
  private readonly fetch: typeof fetch;
  private readonly now: () => number;

  constructor(private readonly options: LocationIqAdapterOptions) {
    this.fetch = options.fetch ?? fetch;
    this.now = options.now ?? Date.now;
  }

  async searchPlaces(query: string): Promise<readonly Place[]> {
    return this.execute('PLACE_PROVIDER_UNAVAILABLE', async () => {
      const search = await this.getJson('/v1/search', {
        q: query,
        format: 'json',
        limit: '20',
      });
      if (!Array.isArray(search)) throw malformed('PLACE_PROVIDER_UNAVAILABLE');
      return search.slice(0, 20).map(placeResult);
    });
  }

  async previewRoute(
    coordinates: readonly Coordinate[],
    vehicle: VehicleMode,
  ): Promise<RoutePreview> {
    return this.execute('ROUTE_UNAVAILABLE', async () => {
      const path = coordinates
        .map(({ latitude, longitude }) => `${longitude},${latitude}`)
        .join(';');
      const route = await this.getJson(
        `/v1/directions/${vehicle === 'car' ? 'driving' : 'driving'}/${path}`,
        { geometries: 'geojson', overview: 'full', steps: 'false' },
      );
      return routeResult(route);
    });
  }

  private async getJson(
    path: string,
    query: Record<string, string>,
  ): Promise<unknown> {
    const url = new URL(path, this.options.baseUrl);
    url.searchParams.set('key', this.options.apiKey);
    for (const [key, value] of Object.entries(query))
      url.searchParams.set(key, value);
    return this.withRetry(async () => {
      const controller = new AbortController();
      const timer = setTimeout(
        () => controller.abort(),
        this.options.timeoutMs,
      );
      try {
        const response = await this.fetch(url, { signal: controller.signal });
        if (!response.ok) {
          throw new ProviderHttpError(
            response.status === 408 ||
              response.status === 429 ||
              response.status >= 500,
          );
        }
        return (await response.json()) as unknown;
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
    code: GeoProviderErrorCode,
    operation: () => Promise<T>,
  ): Promise<T> {
    if (this.now() < this.openUntil)
      throw new GeoProviderError(
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
      throw new GeoProviderError(
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

function placeResult(value: unknown): Place {
  if (
    !isObject(value) ||
    !isPlaceId(value.place_id) ||
    !isString(value.display_name)
  )
    throw malformed('PLACE_PROVIDER_UNAVAILABLE');
  const latitude = numeric(value.lat);
  const longitude = numeric(value.lon);
  if (
    latitude === undefined ||
    longitude === undefined ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  )
    throw malformed('PLACE_PROVIDER_UNAVAILABLE');
  const name = value.display_name.split(',')[0] ?? value.display_name;
  return {
    id: String(value.place_id),
    name: name.trim() || value.display_name,
    address: value.display_name,
    coordinate: { latitude, longitude },
  };
}

function routeResult(value: unknown): RoutePreview {
  if (
    !isObject(value) ||
    !Array.isArray(value.routes) ||
    !value.routes[0] ||
    !isObject(value.routes[0])
  )
    throw malformed('ROUTE_UNAVAILABLE');
  const route = value.routes[0];
  if (
    !isNumber(route.distance) ||
    !isNumber(route.duration) ||
    !isObject(route.geometry) ||
    route.geometry.type !== 'LineString' ||
    !Array.isArray(route.geometry.coordinates)
  )
    throw malformed('ROUTE_UNAVAILABLE');
  const coordinates = route.geometry.coordinates.map((coordinate) => {
    if (
      !Array.isArray(coordinate) ||
      coordinate.length < 2 ||
      !isNumber(coordinate[0]) ||
      !isNumber(coordinate[1])
    )
      throw malformed('ROUTE_UNAVAILABLE');
    return [coordinate[0], coordinate[1]] as [number, number];
  });
  if (coordinates.length < 2) throw malformed('ROUTE_UNAVAILABLE');
  return {
    geometry: { type: 'LineString', coordinates },
    distanceMeters: route.distance,
    durationSeconds: route.duration,
  };
}

function malformed(code: GeoProviderErrorCode): GeoProviderError {
  return new GeoProviderError(code, 'Location provider response is invalid.');
}
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
function isString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
function isPlaceId(value: unknown): value is string | number {
  return (
    (typeof value === 'string' && value.trim().length > 0) ||
    (typeof value === 'number' && Number.isFinite(value))
  );
}
function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}
function numeric(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}
