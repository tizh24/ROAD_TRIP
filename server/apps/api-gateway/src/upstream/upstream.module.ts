import { Module } from '@nestjs/common';
import { loadGatewayConfig } from '@roadtrip/config';
import { AuthModule } from '../auth/auth.module';
import {
  createCoreTripUpstream,
  createGeoLocationUpstream,
} from './http-upstream.client';
import { UpstreamController } from './upstream.controller';
import { PublicTripController } from './public-trip.controller';
import { BillingWebhookController } from './billing-webhook.controller';
import { CORE_TRIP_UPSTREAM, GEO_LOCATION_UPSTREAM } from './upstream.types';

@Module({
  imports: [AuthModule],
  controllers: [
    BillingWebhookController,
    UpstreamController,
    PublicTripController,
  ],
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
