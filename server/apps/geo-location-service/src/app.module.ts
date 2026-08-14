import { Module } from '@nestjs/common';
import { HealthModule } from '@roadtrip/health';

@Module({
  imports: [HealthModule.register({ service: 'geo-location-service' })],
})
export class AppModule {}
