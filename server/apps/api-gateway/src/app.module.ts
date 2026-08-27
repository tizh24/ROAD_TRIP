import { Module } from '@nestjs/common';
import { HealthModule } from '@roadtrip/health';
import { AuthModule } from './auth/auth.module';
import { SecurityModule } from './security/security.module';
import { UpstreamModule } from './upstream/upstream.module';

@Module({
  imports: [
    AuthModule,
    SecurityModule,
    UpstreamModule,
    HealthModule.register({ service: 'api-gateway' }),
  ],
})
export class AppModule {}
