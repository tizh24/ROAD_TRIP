import { Module } from '@nestjs/common';
import { HealthModule } from '@roadtrip/health';
import { DatabaseModule } from './infrastructure/database/database.module';
import { DatabaseService } from './infrastructure/database/database.service';
import { PostgresTripAccessReader } from './infrastructure/database/postgres-trip-access.reader';
import { StopRepository } from './infrastructure/database/stop.repository';
import { TripRepository } from './infrastructure/database/trip.repository';
import { TripAuthorizationPolicy } from './application/authorization/trip-authorization.policy';
import { TripUseCases } from './application/trip';
import { InternalServiceGuard } from './presentation/internal-service.guard';
import {
  InvitationController,
  TripController,
} from './presentation/trip.controller';
import { BullMqEventPublisher } from './infrastructure/events/bullmq-event-publisher';
import { EVENT_PUBLISHER } from './application/events/event-publisher.port';
import { OutboxPublisher } from './infrastructure/events/outbox-publisher';
import { OutboxMetrics } from './infrastructure/observability/outbox-metrics';
import { MetricsController } from './presentation/metrics.controller';
import { InvitationRepository } from './infrastructure/database/invitation.repository';
import { InvitationUseCases } from './application/trip/invitation.use-cases';

@Module({
  imports: [
    DatabaseModule,
    HealthModule.registerAsync({
      inject: [DatabaseService],
      useFactory: (database: DatabaseService) => ({
        service: 'core-trip-service',
        readinessChecks: [
          { name: 'database', probe: () => database.isReady() },
        ],
      }),
    }),
  ],
  controllers: [TripController, InvitationController, MetricsController],
  providers: [
    InternalServiceGuard,
    OutboxMetrics,
    {
      provide: BullMqEventPublisher,
      useFactory: () => new BullMqEventPublisher(),
    },
    { provide: EVENT_PUBLISHER, useExisting: BullMqEventPublisher },
    {
      provide: OutboxPublisher,
      inject: [DatabaseService, EVENT_PUBLISHER, OutboxMetrics],
      useFactory: (
        database: DatabaseService,
        publisher: BullMqEventPublisher,
        metrics: OutboxMetrics,
      ) => new OutboxPublisher(database, publisher, metrics),
    },
    {
      provide: TripRepository,
      inject: [DatabaseService],
      useFactory: (database: DatabaseService) => new TripRepository(database),
    },
    {
      provide: StopRepository,
      inject: [DatabaseService],
      useFactory: (database: DatabaseService) => new StopRepository(database),
    },
    {
      provide: TripAuthorizationPolicy,
      inject: [DatabaseService],
      useFactory: (database: DatabaseService) =>
        new TripAuthorizationPolicy(new PostgresTripAccessReader(database)),
    },
    {
      provide: TripUseCases,
      inject: [TripRepository, StopRepository, TripAuthorizationPolicy],
      useFactory: (
        trips: TripRepository,
        stops: StopRepository,
        authorization: TripAuthorizationPolicy,
      ) => new TripUseCases(trips, stops, authorization),
    },
    {
      provide: InvitationRepository,
      inject: [DatabaseService],
      useFactory: (database: DatabaseService) =>
        new InvitationRepository(database),
    },
    {
      provide: InvitationUseCases,
      inject: [InvitationRepository, TripAuthorizationPolicy],
      useFactory: (
        invitations: InvitationRepository,
        authorization: TripAuthorizationPolicy,
      ) => new InvitationUseCases(invitations, authorization),
    },
  ],
})
export class AppModule {}
