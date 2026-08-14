import { Module } from '@nestjs/common';
import { HealthModule } from '@roadtrip/health';

@Module({
  imports: [HealthModule.register({ service: 'api-gateway' })],
})
export class AppModule {}
