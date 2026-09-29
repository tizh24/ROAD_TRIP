import { DynamicModule, Module, type FactoryProvider } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService, HEALTH_OPTIONS } from './health.service';
import type {
  HealthModuleAsyncOptions,
  HealthModuleOptions,
} from './health.types';

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

  static registerAsync<Dependencies extends readonly unknown[]>(
    options: HealthModuleAsyncOptions<Dependencies>,
  ): DynamicModule {
    const optionsProvider: FactoryProvider<HealthModuleOptions> = {
      provide: HEALTH_OPTIONS,
      inject: options.inject ?? [],
      useFactory: options.useFactory,
    };

    return {
      module: HealthModule,
      controllers: [HealthController],
      providers: [HealthService, optionsProvider],
      exports: [HealthService],
    };
  }
}
