# ADR-0002: Redis and BullMQ as the initial durable queue

**Status:** Accepted

**Date:** 2026-08-14

## Context

The platform needs asynchronous delivery for trip and invitation events. It
already needs Redis for route cache and rate limiting. As a solo/startup project,
operating RabbitMQ in addition to Redis would add deployment, monitoring, backup,
and incident-response work before event routing becomes complex.

Redis Pub/Sub is not durable: a disconnected consumer can permanently miss a
message. The platform requires retry, backoff, delayed work, concurrency control,
failed-job inspection, and idempotency.

## Decision

Use BullMQ on Redis as the initial durable job/event-delivery adapter.

- PostgreSQL transactional outbox remains the source of unpublished integration
  events.
- An outbox publisher creates a BullMQ job after the business transaction
  commits.
- Integration event ID is the BullMQ job ID to prevent duplicate enqueue.
- Consumers are idempotent and persist processed event IDs.
- Retry is bounded with exponential backoff.
- Failed jobs are retained for inspection and controlled replay.
- Redis Pub/Sub must not carry durable integration events.
- Queue, cache, and rate-limit keys use separate prefixes.
- Bull Board is development-only unless separately secured and approved.

Local development may use one Redis instance. Production queue Redis must enable
persistence and use `noeviction`. Cache and queue Redis must be split when cache
eviction policy, memory pressure, availability, or workload isolation requires
different operational settings.

## Alternatives considered

- RabbitMQ: strong routing and queue semantics, deferred until multiple consumer
  groups or complex routing justify a dedicated broker.
- Redis Streams directly: durable and capable, but would require more custom
  retry, scheduling, and operational code than BullMQ.
- Redis Pub/Sub: rejected because messages can be lost while consumers are down.
- Database polling only: retained for outbox publication but not selected as the
  complete worker queue because scheduling and concurrency would be custom.

## Consequences

- One fewer infrastructure product is required initially.
- Redis configuration becomes critical to job durability.
- Cache traffic can affect queues until instances are separated.
- Application code must depend on an event publisher port so BullMQ can be
  replaced without changing domain logic.

## Exit criteria

Reconsider a dedicated broker when the platform needs complex topic routing,
many independent consumer groups, stronger workload isolation, queue traffic
competes with GPS/cache workloads, or operations show BullMQ/Redis cannot meet
durability and latency objectives.
