import type { GatewayConfig } from '@roadtrip/config';
import type { SupabaseSessionTokens } from './session-cookies';

export interface AuthCredentials {
  email: string;
  password: string;
  fullName?: string;
}

export class SupabaseAuthClient {
  constructor(private readonly config: GatewayConfig) {}

  async register(credentials: AuthCredentials): Promise<{
    confirmationRequired: boolean;
    session?: SupabaseSessionTokens;
  }> {
    const body = await this.request('/auth/v1/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
        ...(credentials.fullName
          ? { data: { full_name: credentials.fullName } }
          : {}),
      }),
    });
    const session = sessionFrom(body);
    return { confirmationRequired: !session, ...(session ? { session } : {}) };
  }

  async login(credentials: AuthCredentials): Promise<SupabaseSessionTokens> {
    const body = await this.request('/auth/v1/token?grant_type=password', {
      method: 'POST',
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });
    return requiredSession(body);
  }

  async refresh(refreshToken: string): Promise<SupabaseSessionTokens> {
    const body = await this.request('/auth/v1/token?grant_type=refresh_token', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    return requiredSession(body);
  }

  async logout(accessToken: string): Promise<void> {
    await this.request('/auth/v1/logout', {
      method: 'POST',
      headers: { authorization: `Bearer ${accessToken}` },
    });
  }

  async requestPasswordReset(email: string, redirectTo: string): Promise<void> {
    await this.request('/auth/v1/recover', {
      method: 'POST',
      body: JSON.stringify({ email, redirect_to: redirectTo }),
    });
  }

  async changePassword(accessToken: string, password: string): Promise<void> {
    await this.request('/auth/v1/user', {
      method: 'PUT',
      headers: { authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ password }),
    });
  }

  private async request(path: string, init: RequestInit): Promise<unknown> {
    const response = await fetch(new URL(path, this.config.SUPABASE_URL), {
      ...init,
      headers: {
        apikey: this.config.SUPABASE_PUBLISHABLE_KEY,
        'content-type': 'application/json',
        ...init.headers,
      },
    });
    if (!response.ok) throw new SupabaseAuthRequestError(response.status);
    if (response.status === 204) return undefined;
    return response.json();
  }
}

export class SupabaseAuthRequestError extends Error {
  constructor(readonly status: number) {
    super('Supabase Auth request failed');
  }
}

function requiredSession(body: unknown): SupabaseSessionTokens {
  const session = sessionFrom(body);
  if (!session) throw new SupabaseAuthRequestError(502);
  return session;
}

function sessionFrom(body: unknown): SupabaseSessionTokens | undefined {
  if (typeof body !== 'object' || body === null) return undefined;
  const value = body as Record<string, unknown>;
  if (
    typeof value.access_token !== 'string' ||
    typeof value.refresh_token !== 'string' ||
    typeof value.expires_in !== 'number' ||
    !Number.isFinite(value.expires_in) ||
    value.expires_in <= 0
  ) {
    return undefined;
  }
  return {
    accessToken: value.access_token,
    refreshToken: value.refresh_token,
    expiresIn: Math.floor(value.expires_in),
  };
}
