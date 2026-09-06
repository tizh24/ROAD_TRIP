import { HttpException } from '@nestjs/common';
import { GeoController } from './geo.controller';

describe('GeoController', () => {
  const geo = {
    search: jest.fn().mockResolvedValue({
      places: [
        {
          id: 'place-1',
          name: 'Cafe',
          address: 'Da Nang',
          coordinate: { latitude: 16.05, longitude: 108.2 },
        },
      ],
      source: 'provider',
    }),
    route: jest.fn().mockResolvedValue({
      preview: {
        geometry: {
          type: 'LineString',
          coordinates: [
            [108.2, 16.05],
            [108.3, 16.1],
          ],
        },
        distanceMeters: 12,
        durationSeconds: 4,
      },
      source: 'cache',
    }),
  };

  beforeEach(() => jest.clearAllMocks());

  it('returns a contract-compatible place-search envelope', async () => {
    const result = await new GeoController(geo as never).search({ q: 'Cafe' });
    expect(result).toMatchObject({
      data: [expect.objectContaining({ id: 'place-1' })],
      meta: { pagination: { nextCursor: null, hasMore: false } },
    });
  });

  it('rejects invalid route input without calling the provider', async () => {
    await expect(
      new GeoController(geo as never).route({ coordinates: [] }),
    ).rejects.toBeInstanceOf(HttpException);
    expect(geo.route).not.toHaveBeenCalled();
  });
});
