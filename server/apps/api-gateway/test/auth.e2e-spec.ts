import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { correlationIdMiddleware } from '@roadtrip/observability';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { setGatewayTestEnv } from './test-env';

const issuer = 'https://issuer.test/auth/v1';
const audience = 'authenticated';
const userId = '7f42c1e6-973b-4f9c-a8c1-1c833dbe16d7';

describe('Gateway authentication (e2e)', () => {
  let app: INestApplication<App>;
  let jwksServer: Server;
  let privateKey: CryptoKey;
  let invalidPrivateKey: CryptoKey;

  beforeAll(async () => {
    const jose = await import('jose');
    const keyPair = await jose.generateKeyPair('ES256');
    const invalidKeyPair = await jose.generateKeyPair('ES256');
    privateKey = keyPair.privateKey;
    invalidPrivateKey = invalidKeyPair.privateKey;
    const publicJwk = {
      ...(await jose.exportJWK(keyPair.publicKey)),
      alg: 'ES256',
      kid: 'gateway-test-key',
      use: 'sig',
    };
    jwksServer = createServer((_request, response) => {
      response.writeHead(200, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ keys: [publicJwk] }));
    });
    await new Promise<void>((resolve) =>
      jwksServer.listen(0, '127.0.0.1', resolve),
    );
    const address = jwksServer.address() as AddressInfo;
    setGatewayTestEnv({
      SUPABASE_JWKS_URL: `http://127.0.0.1:${address.port}/jwks`,
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.use(correlationIdMiddleware());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await new Promise<void>((resolve, reject) =>
      jwksServer.close((error) => (error ? reject(error) : resolve())),
    );
  });

  async function sign(
    signingKey: CryptoKey,
    expirationTime: number | string = '5m',
  ) {
    const jose = await import('jose');
    return new jose.SignJWT({
      role: 'authenticated',
      email: 'traveler@example.com',
    })
      .setProtectedHeader({ alg: 'ES256', kid: 'gateway-test-key', typ: 'JWT' })
      .setIssuer(issuer)
      .setAudience(audience)
      .setSubject(userId)
      .setIssuedAt()
      .setExpirationTime(expirationTime)
      .sign(signingKey);
  }

  it('returns the verified minimal identity for a valid token', async () => {
    const token = await sign(privateKey);

    await request(app.getHttpServer())
      .get('/api/v1/me')
      .set('authorization', `Bearer ${token}`)
      .set('x-correlation-id', 'auth-e2e-valid')
      .expect(200)
      .expect({
        data: {
          id: userId,
          role: 'authenticated',
          email: 'traveler@example.com',
        },
        meta: { correlationId: 'auth-e2e-valid' },
      });
  });

  it('returns AUTH_REQUIRED when the bearer token is missing', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/me')
      .set('x-correlation-id', 'auth-e2e-missing')
      .expect(401)
      .expect(({ body }) => {
        expect(body).toEqual({
          error: {
            code: 'AUTH_REQUIRED',
            message: 'Authentication is required.',
          },
          meta: { correlationId: 'auth-e2e-missing' },
        });
      });
  });

  it.each([
    ['expired', () => sign(privateKey, Math.floor(Date.now() / 1000) - 60)],
    ['invalid', () => sign(invalidPrivateKey)],
  ])('returns AUTH_INVALID for an %s token', async (_case, tokenFactory) => {
    await request(app.getHttpServer())
      .get('/api/v1/me')
      .set('authorization', `Bearer ${await tokenFactory()}`)
      .set('x-correlation-id', `auth-e2e-${_case}`)
      .expect(401)
      .expect(({ body }) => {
        expect(body).toEqual({
          error: {
            code: 'AUTH_INVALID',
            message: 'Authentication token is invalid or expired.',
          },
          meta: { correlationId: `auth-e2e-${_case}` },
        });
      });
  });
});
