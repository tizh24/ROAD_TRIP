import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import {
  InvalidAuthenticationTokenError,
  SupabaseJwtVerifier,
} from './supabase-jwt.verifier';

const issuer = 'https://issuer.test/auth/v1';
const audience = 'authenticated';
const userId = '7f42c1e6-973b-4f9c-a8c1-1c833dbe16d7';

describe('SupabaseJwtVerifier', () => {
  let server: Server;
  let jwksUrl: string;
  let requestCount: number;
  let publishedKeys: Record<string, unknown>[];
  let primaryKeyPair: { privateKey: CryptoKey; publicKey: CryptoKey };
  let rotatedKeyPair: { privateKey: CryptoKey; publicKey: CryptoKey };
  let primaryJwk: Record<string, unknown>;
  let rotatedJwk: Record<string, unknown>;

  beforeAll(async () => {
    const jose = await import('jose');
    primaryKeyPair = await jose.generateKeyPair('ES256');
    rotatedKeyPair = await jose.generateKeyPair('ES256');
    primaryJwk = {
      ...(await jose.exportJWK(primaryKeyPair.publicKey)),
      alg: 'ES256',
      kid: 'primary-key',
      use: 'sig',
    };
    rotatedJwk = {
      ...(await jose.exportJWK(rotatedKeyPair.publicKey)),
      alg: 'ES256',
      kid: 'rotated-key',
      use: 'sig',
    };
    server = createServer((_request, response) => {
      requestCount += 1;
      response.writeHead(200, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ keys: publishedKeys }));
    });
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    const address = server.address() as AddressInfo;
    jwksUrl = `http://127.0.0.1:${address.port}/jwks`;
  });

  beforeEach(() => {
    requestCount = 0;
    publishedKeys = [primaryJwk];
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  });

  async function sign(
    privateKey: CryptoKey,
    kid: string,
    expirationTime: number | string = '5m',
  ) {
    const jose = await import('jose');
    return new jose.SignJWT({
      role: 'authenticated',
      email: 'traveler@example.com',
      session_id: 'c6118a53-c845-4026-9970-d63f332b32ba',
    })
      .setProtectedHeader({ alg: 'ES256', kid, typ: 'JWT' })
      .setIssuer(issuer)
      .setAudience(audience)
      .setSubject(userId)
      .setIssuedAt()
      .setExpirationTime(expirationTime)
      .sign(privateKey);
  }

  function createVerifier() {
    return new SupabaseJwtVerifier({
      jwksUrl,
      issuer,
      audience,
      jwksCooldownMs: 0,
    });
  }

  it('verifies a valid token and creates a minimal user context', async () => {
    const context = await createVerifier().verify(
      await sign(primaryKeyPair.privateKey, 'primary-key'),
    );

    expect(context).toEqual({
      userId,
      role: 'authenticated',
      email: 'traveler@example.com',
      sessionId: 'c6118a53-c845-4026-9970-d63f332b32ba',
    });
  });

  it('rejects expired and incorrectly signed tokens', async () => {
    const jose = await import('jose');
    const attackerKeyPair = await jose.generateKeyPair('ES256');
    const verifier = createVerifier();
    const expired = await sign(
      primaryKeyPair.privateKey,
      'primary-key',
      Math.floor(Date.now() / 1000) - 60,
    );
    const invalid = await sign(attackerKeyPair.privateKey, 'primary-key');

    await expect(verifier.verify(expired)).rejects.toBeInstanceOf(
      InvalidAuthenticationTokenError,
    );
    await expect(verifier.verify(invalid)).rejects.toBeInstanceOf(
      InvalidAuthenticationTokenError,
    );
  });

  it('caches JWKS and reloads it when a rotated kid appears', async () => {
    const verifier = createVerifier();
    await verifier.verify(await sign(primaryKeyPair.privateKey, 'primary-key'));
    await verifier.verify(await sign(primaryKeyPair.privateKey, 'primary-key'));
    expect(requestCount).toBe(1);

    publishedKeys = [primaryJwk, rotatedJwk];
    await verifier.verify(await sign(rotatedKeyPair.privateKey, 'rotated-key'));
    expect(requestCount).toBe(2);
  });
});
