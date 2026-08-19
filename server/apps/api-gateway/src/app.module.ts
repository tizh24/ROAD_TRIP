import { Module } from '@nestjs/common';
import { HealthModule } from '@roadtrip/health';
import { AuthModule } from './auth/auth.module';
import { SecurityModule } from './security/security.module';

@Module({
  imports: [
    AuthModule,
    SecurityModule,
    HealthModule.register({ service: 'api-gateway' }),
  ],
})
export class AppModule {}
