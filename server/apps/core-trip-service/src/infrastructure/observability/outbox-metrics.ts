import { Injectable } from '@nestjs/common';

@Injectable()
export class OutboxMetrics {
  private published = 0;
  private failed = 0;
  private lagSeconds = 0;
  recordPublished() {
    this.published += 1;
  }
  recordFailed() {
    this.failed += 1;
  }
  observeLag(occurredAt: Date | string) {
    const time = new Date(occurredAt).getTime();
    if (!Number.isNaN(time))
      this.lagSeconds = Math.max(0, (Date.now() - time) / 1_000);
  }
  renderPrometheus(): string {
    return `# TYPE roadtrip_outbox_events_published_total counter\nroadtrip_outbox_events_published_total ${this.published}\n# TYPE roadtrip_outbox_events_failed_total counter\nroadtrip_outbox_events_failed_total ${this.failed}\n# TYPE roadtrip_outbox_claimed_lag_seconds gauge\nroadtrip_outbox_claimed_lag_seconds ${this.lagSeconds}\n`;
  }
}
