import { Module } from '@nestjs/common';
import { loadGatewayConfig } from '@roadtrip/config';
import {
  createCoreTripUpstream,
  createGeoLocationUpstream,
} from './http-upstream.client';
import { UpstreamController } from './upstream.controller';
import { CORE_TRIP_UPSTREAM, GEO_LOCATION_UPSTREAM } from './upstream.types';

@Module({
  controllers: [UpstreamController],
  providers: [
    {
      provide: CORE_TRIP_UPSTREAM,
      useFactory: () => createCoreTripUpstream(loadGatewayConfig()),
    },
    {
      provide: GEO_LOCATION_UPSTREAM,
      useFactory: () => createGeoLocationUpstream(loadGatewayConfig()),
    },
  ],
})
export class UpstreamModule {}
