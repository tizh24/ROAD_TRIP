import { Inject, Injectable } from '@nestjs/common';
import type {
  HealthModuleOptions,
  LivenessResult,
  ReadinessResult,
} from './health.types';

export const HEALTH_OPTIONS = Symbol('HEALTH_OPTIONS');

@Injectable()
export class HealthService {
  constructor(
    @Inject(HEALTH_OPTIONS) private readonly options: HealthModuleOptions,
  ) {}

  liveness(): LivenessResult {
    return {
      status: 'alive',
      service: this.options.service,
      timestamp: new Date().toISOString(),
    };
  }

  async readiness(): Promise<ReadinessResult> {
    const entries = await Promise.all(
      (this.options.readinessChecks ?? []).map(async ({ name, probe }) => {
        try {
          return [name, (await probe()) ? 'up' : 'down'] as const;
        } catch {
          return [name, 'down'] as const;
        }
      }),
    );
    const checks = Object.fromEntries(entries);
    const ready = Object.values(checks).every((status) => status === 'up');
    return {
      status: ready ? 'ready' : 'not_ready',
      service: this.options.service,
      checks,
      timestamp: new Date().toISOString(),
    };
  }
}
