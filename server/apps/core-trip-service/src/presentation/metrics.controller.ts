import { Controller, Get, Header } from '@nestjs/common';
import { OutboxMetrics } from '../infrastructure/observability/outbox-metrics';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metrics: OutboxMetrics) {}
  @Get()
  @Header('content-type', 'text/plain; version=0.0.4; charset=utf-8')
  getMetrics(): string {
    return this.metrics.renderPrometheus();
  }
}
