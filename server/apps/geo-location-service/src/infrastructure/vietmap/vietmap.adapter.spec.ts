import { VietMapAdapter } from './vietmap.adapter';

const response = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
const adapter = (mockFetch: typeof fetch) =>
  new VietMapAdapter({
    baseUrl: 'https://maps.vietmap.vn',
    apiKey: 'not-a-real-key',
    timeoutMs: 100,
    fetch: mockFetch,
  });

describe('VietMapAdapter', () => {
  it('normalizes a search result and place detail', async () => {
    const mockFetch = jest
      .fn()
      .mockResolvedValueOnce(
        response([{ ref_id: 'poi-1', name: 'Cafe', address: 'Da Nang' }]),
      )
      .mockResolvedValueOnce(response({ lat: 16.05, lng: 108.2 }));
    await expect(adapter(mockFetch).searchPlaces('Cafe')).resolves.toEqual([
      {
        id: 'poi-1',
        name: 'Cafe',
        address: 'Da Nang',
        coordinate: { latitude: 16.05, longitude: 108.2 },
      },
    ]);
  });
  it('rejects malformed provider payloads', async () => {
    await expect(
      adapter(
        jest.fn().mockResolvedValue(response({ unexpected: true })),
      ).searchPlaces('Cafe'),
    ).rejects.toMatchObject({ code: 'PLACE_PROVIDER_UNAVAILABLE' });
  });
  it('retries a provider rate limit once then maps it to a stable error', async () => {
    const mockFetch = jest.fn().mockResolvedValue(response({}, 429));
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
  it('maps an aborted provider request to a stable error', async () => {
    const mockFetch = jest
      .fn()
      .mockRejectedValue(new DOMException('aborted', 'AbortError'));
    await expect(adapter(mockFetch).searchPlaces('Cafe')).rejects.toMatchObject(
      { code: 'PLACE_PROVIDER_UNAVAILABLE' },
    );
  });
});
