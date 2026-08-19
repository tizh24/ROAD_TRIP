import { Module } from '@nestjs/common';
import { HealthModule } from '@roadtrip/health';
import { DatabaseModule } from './infrastructure/database/database.module';
import { DatabaseService } from './infrastructure/database/database.service';

@Module({
  imports: [
    DatabaseModule,
    HealthModule.registerAsync({
      inject: [DatabaseService],
      useFactory: (database: DatabaseService) => ({
        service: 'core-trip-service',
        readinessChecks: [
          { name: 'database', probe: () => database.isReady() },
        ],
      }),
    }),
  ],
})
export class AppModule {}
