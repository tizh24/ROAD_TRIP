import type { AuthenticatedUserContext } from './auth.types';
import type { JWTVerifyOptions } from 'jose';

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface SupabaseJwtVerifierOptions {
  jwksUrl: string;
  issuer: string;
  audience: string;
  jwtSecret?: string;
  authUserUrl?: string;
  publishableKey?: string;
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
      const protectedHeader = jose.decodeProtectedHeader(token);
      const verificationOptions = {
        issuer: this.options.issuer,
        audience: this.options.audience,
        typ: 'JWT',
        requiredClaims: ['sub', 'role'],
        clockTolerance: 5,
      } satisfies JWTVerifyOptions;
      try {
        const { payload } = protectedHeader.alg === 'HS256'
          ? await this.verifyLegacyHs256(token, jose, verificationOptions)
          : await this.verifyWithJwks(token, jose, verificationOptions);
        return userContextFromPayload(payload);
      } catch (error) {
        // Legacy shared secrets may be unavailable in newer Supabase projects.
        // Supabase Auth remains the authority for HS256 verification in that case.
        if (protectedHeader.alg === 'HS256') {
          return this.verifyHs256WithSupabaseAuth(token);
        }
        throw error;
      }
    } catch {
      throw new InvalidAuthenticationTokenError();
    }
  }

  private async verifyLegacyHs256(
    token: string,
    jose: typeof import('jose'),
    verificationOptions: JWTVerifyOptions,
  ) {
    if (!this.options.jwtSecret) throw new InvalidAuthenticationTokenError();
    return jose.jwtVerify(
      token,
      new TextEncoder().encode(this.options.jwtSecret),
      { ...verificationOptions, algorithms: ['HS256'] },
    );
  }

  private async verifyWithJwks(
    token: string,
    jose: typeof import('jose'),
    verificationOptions: JWTVerifyOptions,
  ) {
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
    return jose.jwtVerify(token, remoteJwkSet, {
      ...verificationOptions,
      algorithms: ['ES256', 'RS256'],
    });
  }

  private async verifyHs256WithSupabaseAuth(
    token: string,
  ): Promise<AuthenticatedUserContext> {
    if (!this.options.authUserUrl || !this.options.publishableKey) {
      throw new InvalidAuthenticationTokenError();
    }

    const response = await fetch(this.options.authUserUrl, {
      headers: {
        apikey: this.options.publishableKey,
        authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) throw new InvalidAuthenticationTokenError();

    const value: unknown = await response.json();
    if (!value || typeof value !== 'object') {
      throw new InvalidAuthenticationTokenError();
    }
    const user = value as Record<string, unknown>;
    if (typeof user.id !== 'string' || !uuidPattern.test(user.id)) {
      throw new InvalidAuthenticationTokenError();
    }

    return {
      userId: user.id,
      authRole: 'authenticated',
      ...(typeof user.email === 'string' ? { email: user.email } : {}),
    };
  }
}

function userContextFromPayload(payload: Record<string, unknown>): AuthenticatedUserContext {
  if (
    typeof payload.sub !== 'string' ||
    !uuidPattern.test(payload.sub) ||
    payload.role !== 'authenticated'
  ) {
    throw new InvalidAuthenticationTokenError();
  }

  return {
    userId: payload.sub,
    authRole: 'authenticated',
    ...(typeof payload.email === 'string' ? { email: payload.email } : {}),
    ...(typeof payload.session_id === 'string'
      ? { sessionId: payload.session_id }
      : {}),
  };
}
