import type { AuthenticatedUserContext } from './auth.types';

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface SupabaseJwtVerifierOptions {
  jwksUrl: string;
  issuer: string;
  audience: string;
  jwksTimeoutMs?: number;
  jwksCooldownMs?: number;
  jwksCacheMaxAgeMs?: number;
}

export class InvalidAuthenticationTokenError extends Error {
  constructor() {
    super('Authentication token verification failed');
    this.name = 'InvalidAuthenticationTokenError';
  }
}

export class SupabaseJwtVerifier {
  private remoteJwkSet: unknown;

  constructor(private readonly options: SupabaseJwtVerifierOptions) {}

  async verify(token: string): Promise<AuthenticatedUserContext> {
    try {
      const jose = await import('jose');
      this.remoteJwkSet ??= jose.createRemoteJWKSet(
        new URL(this.options.jwksUrl),
        {
          timeoutDuration: this.options.jwksTimeoutMs ?? 5_000,
          cooldownDuration: this.options.jwksCooldownMs ?? 30_000,
          cacheMaxAge: this.options.jwksCacheMaxAgeMs ?? 600_000,
        },
      );
      const remoteJwkSet = this.remoteJwkSet as ReturnType<
        typeof jose.createRemoteJWKSet
      >;
      const { payload } = await jose.jwtVerify(token, remoteJwkSet, {
        algorithms: ['ES256', 'RS256'],
        issuer: this.options.issuer,
        audience: this.options.audience,
        typ: 'JWT',
        requiredClaims: ['sub', 'role'],
        clockTolerance: 5,
      });

      if (
        typeof payload.sub !== 'string' ||
        !uuidPattern.test(payload.sub) ||
        payload.role !== 'authenticated'
      ) {
        throw new InvalidAuthenticationTokenError();
      }

      return {
        userId: payload.sub,
        role: 'authenticated',
        ...(typeof payload.email === 'string' ? { email: payload.email } : {}),
        ...(typeof payload.session_id === 'string'
          ? { sessionId: payload.session_id }
          : {}),
      };
    } catch {
      throw new InvalidAuthenticationTokenError();
    }
  }
}
