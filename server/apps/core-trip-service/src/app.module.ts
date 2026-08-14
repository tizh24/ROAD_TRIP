import { Module } from '@nestjs/common';
import { HealthModule } from '@roadtrip/health';

@Module({
  imports: [HealthModule.register({ service: 'core-trip-service' })],
})
export class AppModule {}
