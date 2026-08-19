import { Module } from '@nestjs/common';
import { HealthModule } from '@roadtrip/health';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AuthModule, HealthModule.register({ service: 'api-gateway' })],
})
export class AppModule {}
