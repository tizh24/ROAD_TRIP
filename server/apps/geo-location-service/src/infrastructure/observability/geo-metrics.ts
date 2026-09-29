import { Injectable } from '@nestjs/common';

@Injectable()
export class GeoMetrics {
  private providerCalls = 0;
  private cacheHits = 0;
  private cacheMisses = 0;
  private providerLatencyMs = 0;
  recordProviderCall(latencyMs: number): void {
    this.providerCalls += 1;
    this.providerLatencyMs += latencyMs;
  }
  recordCacheHit(): void {
    this.cacheHits += 1;
  }
  recordCacheMiss(): void {
    this.cacheMisses += 1;
  }
  renderPrometheus(): string {
    return `# TYPE roadtrip_geo_provider_calls_total counter\nroadtrip_geo_provider_calls_total ${this.providerCalls}\n# TYPE roadtrip_geo_cache_hits_total counter\nroadtrip_geo_cache_hits_total ${this.cacheHits}\n# TYPE roadtrip_geo_cache_misses_total counter\nroadtrip_geo_cache_misses_total ${this.cacheMisses}\n# TYPE roadtrip_geo_provider_latency_ms_total counter\nroadtrip_geo_provider_latency_ms_total ${this.providerLatencyMs}\n`;
  }
}
