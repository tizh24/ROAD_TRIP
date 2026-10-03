import { LocationIqAdapter } from './locationiq.adapter';

const response = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
const adapter = (mockFetch: typeof fetch) =>
  new LocationIqAdapter({
    baseUrl: 'https://us1.locationiq.com',
    apiKey: 'not-a-real-key',
    timeoutMs: 100,
    fetch: mockFetch,
  });

describe('LocationIqAdapter', () => {
  it('normalizes a place search result without issuing per-place detail calls', async () => {
    const mockFetch = jest
      .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
      .mockResolvedValue(
        response([
          {
            place_id: 'poi-1',
            display_name: 'Dragon Bridge, Da Nang',
            lat: '16.061',
            lon: '108.227',
          },
        ]),
      );
    await expect(
      adapter(mockFetch).searchPlaces('Dragon Bridge'),
    ).resolves.toEqual([
      {
        id: 'poi-1',
        name: 'Dragon Bridge',
        address: 'Dragon Bridge, Da Nang',
        coordinate: { latitude: 16.061, longitude: 108.227 },
      },
    ]);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(requestUrl(mockFetch).searchParams.get('key')).toBe(
      'not-a-real-key',
    );
  });

  it('uses longitude,latitude and normalizes a GeoJSON directions route', async () => {
    const mockFetch = jest
      .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
      .mockResolvedValue(
        response({
          code: 'Ok',
          routes: [
            {
              distance: 1250,
              duration: 180,
              geometry: {
                type: 'LineString',
                coordinates: [
                  [108.2, 16.05],
                  [108.22, 16.07],
                ],
              },
            },
          ],
        }),
      );
    await expect(
      adapter(mockFetch).previewRoute(
        [
          { latitude: 16.05, longitude: 108.2 },
          { latitude: 16.07, longitude: 108.22 },
        ],
        'motorcycle',
      ),
    ).resolves.toMatchObject({ distanceMeters: 1250, durationSeconds: 180 });
    expect(requestUrl(mockFetch).pathname).toBe(
      '/v1/directions/driving/108.2,16.05;108.22,16.07',
    );
  });

  it('rejects malformed provider payloads and retries a rate limit once', async () => {
    await expect(
      adapter(
        jest.fn().mockResolvedValue(response({ unexpected: true })),
      ).searchPlaces('Cafe'),
    ).rejects.toMatchObject({ code: 'PLACE_PROVIDER_UNAVAILABLE' });
    const mockFetch = jest
      .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
      .mockResolvedValue(response({}, 429));
    await expect(
      adapter(mockFetch).previewRoute(
        [
          { latitude: 16, longitude: 108 },
          { latitude: 16.1, longitude: 108.1 },
        ],
        'car',
      ),
    ).rejects.toMatchObject({ code: 'ROUTE_UNAVAILABLE' });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});

function requestUrl(mockFetch: jest.MockedFunction<typeof fetch>): URL {
  const input = mockFetch.mock.calls[0]?.[0];
  if (!(input instanceof URL)) throw new Error('Expected a URL request.');
  return input;
}
