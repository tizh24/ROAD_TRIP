import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import {
  HttpUpstreamClient,
  UpstreamUnavailableException,
} from './http-upstream.client';

describe('HttpUpstreamClient', () => {
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    server = createServer((request, response) => {
      if (request.url === '/slow') return;
      response.writeHead(201, { 'content-type': 'application/json' });
      response.end(
        JSON.stringify({
          method: request.method,
          correlationId: request.headers['x-correlation-id'],
          userId: request.headers['x-roadtrip-user-id'],
          internalToken: request.headers['x-roadtrip-internal-token'],
        }),
      );
    });
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterEach(
    () =>
      new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      ),
  );

  it('forwards safe gateway context and returns the upstream envelope', async () => {
    const client = new HttpUpstreamClient(baseUrl, 100, 'internal-token');

    await expect(
      client.request({
        method: 'GET',
        path: '/api/v1/trips?limit=10',
        headers: {
          'x-correlation-id': 'gateway-test',
          'x-roadtrip-user-id': 'user-123',
        },
      }),
    ).resolves.toEqual({
      status: 201,
      body: {
        method: 'GET',
        correlationId: 'gateway-test',
        userId: 'user-123',
        internalToken: 'internal-token',
      },
    });
  });

  it('maps a timed-out upstream request to a controlled failure', async () => {
    const client = new HttpUpstreamClient(baseUrl, 10, 'internal-token');

    await expect(
      client.request({ method: 'GET', path: '/slow', headers: {} }),
    ).rejects.toBeInstanceOf(UpstreamUnavailableException);
  });
});
