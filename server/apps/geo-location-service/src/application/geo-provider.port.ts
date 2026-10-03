import type { Coordinate, Place, VehicleMode } from '@roadtrip/contracts';

export type GeoProviderErrorCode =
  'PLACE_PROVIDER_UNAVAILABLE' | 'ROUTE_UNAVAILABLE';

export class GeoProviderError extends Error {
  constructor(
    readonly code: GeoProviderErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'GeoProviderError';
  }
}

export interface RoutePreview {
  readonly geometry: {
    readonly type: 'LineString';
    readonly coordinates: readonly [number, number][];
  };
  readonly distanceMeters: number;
  readonly durationSeconds: number;
}

export interface GeoProvider {
  searchPlaces(query: string): Promise<readonly Place[]>;
  previewRoute(
    coordinates: readonly Coordinate[],
    vehicle: VehicleMode,
  ): Promise<RoutePreview>;
}
