import { Module } from '@nestjs/common';
import { HealthModule } from '@roadtrip/health';

@Module({
  imports: [HealthModule.register({ service: 'notification-worker' })],
})
export class AppModule {}
