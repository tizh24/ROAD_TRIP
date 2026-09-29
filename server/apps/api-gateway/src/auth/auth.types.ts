export interface AuthenticatedUserContext {
  userId: string;
  role: 'authenticated';
  email?: string;
  sessionId?: string;
}

export interface AuthTokenVerifier {
  verify(token: string): Promise<AuthenticatedUserContext>;
}

export const AUTH_TOKEN_VERIFIER = Symbol('AUTH_TOKEN_VERIFIER');
