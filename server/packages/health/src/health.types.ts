import type { FactoryProvider } from '@nestjs/common';

export type ReadinessProbe = () => boolean | Promise<boolean>;

export interface ReadinessCheck {
  name: string;
  probe: ReadinessProbe;
}

export interface HealthModuleOptions {
  service: string;
  readinessChecks?: readonly ReadinessCheck[];
}

export interface HealthModuleAsyncOptions<
  Dependencies extends readonly unknown[] = readonly unknown[],
> {
  inject?: FactoryProvider['inject'];
  useFactory: (
    ...dependencies: Dependencies
  ) => HealthModuleOptions | Promise<HealthModuleOptions>;
}

export interface LivenessResult {
  status: 'alive';
  service: string;
  timestamp: string;
}

export interface ReadinessResult {
  status: 'ready' | 'not_ready';
  service: string;
  checks: Record<string, 'up' | 'down'>;
  timestamp: string;
}
