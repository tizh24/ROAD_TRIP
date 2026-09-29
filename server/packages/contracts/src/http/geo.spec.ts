import {
  placeSearchQuerySchema,
  routePreviewRequestSchema,
  routePreviewSchema,
} from './geo';

describe('Geo HTTP contracts', () => {
  it('normalizes valid place-search pagination input', () => {
    expect(
      placeSearchQuerySchema.parse({ q: '  Da Nang  ', limit: '10' }),
    ).toEqual({
      q: 'Da Nang',
      limit: 10,
    });
  });

  it.each([
    {
      coordinates: [
        { latitude: 91, longitude: 0 },
        { latitude: 0, longitude: 0 },
      ],
    },
    { coordinates: [{ latitude: 0, longitude: 0 }] },
    {
      coordinates: [
        { latitude: 0, longitude: 181 },
        { latitude: 0, longitude: 0 },
      ],
    },
  ])('rejects invalid route coordinates', (input) => {
    expect(routePreviewRequestSchema.safeParse(input).success).toBe(false);
  });

  it('accepts a provider-independent route response', () => {
    expect(
      routePreviewSchema.safeParse({
        geometry: {
          type: 'LineString',
          coordinates: [
            [108.2, 16.1],
            [108.3, 16.2],
          ],
        },
        distanceMeters: 12_300,
        durationSeconds: 1_800,
        source: 'provider',
        calculatedAt: '2026-08-29T00:00:00.000Z',
      }).success,
    ).toBe(true);
  });
});
