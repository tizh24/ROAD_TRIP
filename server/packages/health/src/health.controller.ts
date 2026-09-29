import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { HealthService } from './health.service';
import type { LivenessResult, ReadinessResult } from './health.types';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('live')
  live(): LivenessResult {
    return this.healthService.liveness();
  }

  @Get('ready')
  async ready(): Promise<ReadinessResult> {
    const result = await this.healthService.readiness();
    if (result.status === 'not_ready') {
      throw new HttpException(result, HttpStatus.SERVICE_UNAVAILABLE);
    }
    return result;
  }
}
