import { DynamicModule, Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService, HEALTH_OPTIONS } from './health.service';
import type { HealthModuleOptions } from './health.types';

@Module({})
export class HealthModule {
  static register(options: HealthModuleOptions): DynamicModule {
    return {
      module: HealthModule,
      controllers: [HealthController],
      providers: [
        HealthService,
        { provide: HEALTH_OPTIONS, useValue: Object.freeze(options) },
      ],
      exports: [HealthService],
    };
  }
}
