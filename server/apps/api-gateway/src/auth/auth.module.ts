import { Module } from '@nestjs/common';
import { loadGatewayConfig } from '@roadtrip/config';
import { AuthController } from './auth.controller';
import { AUTH_TOKEN_VERIFIER } from './auth.types';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { SupabaseJwtVerifier } from './supabase-jwt.verifier';

@Module({
  controllers: [AuthController],
  providers: [
    SupabaseAuthGuard,
    {
      provide: AUTH_TOKEN_VERIFIER,
      useFactory: () => {
        const config = loadGatewayConfig();
        return new SupabaseJwtVerifier({
          jwksUrl: config.SUPABASE_JWKS_URL,
          issuer: config.SUPABASE_JWT_ISSUER,
          audience: config.SUPABASE_JWT_AUDIENCE,
        });
      },
    },
  ],
})
export class AuthModule {}
