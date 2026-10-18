import { Module } from '@nestjs/common';
import { loadGatewayConfig } from '@roadtrip/config';
import { AuthController } from './auth.controller';
import { AUTH_TOKEN_VERIFIER, GATEWAY_AUTH_CONFIG } from './auth.types';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { SupabaseJwtVerifier } from './supabase-jwt.verifier';
import { PLATFORM_PROFILE_STORE } from './auth.types';
import { PlatformAuthorizationService } from './platform-authorization.service';
import { SupabasePlatformProfileStore } from './platform-profile.store';
import { AuthBffController } from './auth-bff.controller';
import { CsrfGuard } from './csrf.guard';
import { ProfileController } from './profile.controller';

import { AdminController } from './admin.controller';
import { CapabilityGuard } from './capability.guard';

@Module({
  controllers: [
    AuthController,
    AuthBffController,
    ProfileController,
    AdminController,
  ],
  providers: [
    SupabaseAuthGuard,
    CapabilityGuard,
    CsrfGuard,
    PlatformAuthorizationService,
    {
      provide: GATEWAY_AUTH_CONFIG,
      useFactory: () => loadGatewayConfig(),
    },
    {
      provide: AUTH_TOKEN_VERIFIER,
      useFactory: () => {
        const config = loadGatewayConfig();
        return new SupabaseJwtVerifier({
          jwksUrl: config.SUPABASE_JWKS_URL,
          issuer: config.SUPABASE_JWT_ISSUER,
          audience: config.SUPABASE_JWT_AUDIENCE,
          authUserUrl: new URL('/auth/v1/user', config.SUPABASE_URL).toString(),
          publishableKey: config.SUPABASE_PUBLISHABLE_KEY,
          ...(config.SUPABASE_JWT_SECRET
            ? { jwtSecret: config.SUPABASE_JWT_SECRET }
            : {}),
        });
      },
    },
    {
      provide: PLATFORM_PROFILE_STORE,
      useFactory: () => new SupabasePlatformProfileStore(loadGatewayConfig()),
    },
  ],
  exports: [
    AUTH_TOKEN_VERIFIER,
    GATEWAY_AUTH_CONFIG,
    SupabaseAuthGuard,
    CapabilityGuard,
    PlatformAuthorizationService,
  ],
})
export class AuthModule {}
