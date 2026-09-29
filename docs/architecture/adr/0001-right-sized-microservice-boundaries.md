# ADR-0001: Right-sized microservice boundaries

**Status:** Accepted

**Date:** 2026-08-14

## Context

The original backend design split the platform into approximately fifteen
services. That topology separated capabilities that share lifecycle,
transactions, data, and change patterns, creating operational cost before the
product had a complete user journey. A single undifferentiated monolith would
reduce operations but weaken the desired learning and independent-scaling goals.

## Decision

Use five bounded-context services and one edge gateway:

- Core Trip owns trips, itineraries, membership, check-ins, expenses, and trip
  memories.
- Geo Location owns places, routing, VietMap integration, tracking, proximity,
  and geographic alerts.
- Social Community owns profiles and social/community interactions.
- Monetization owns partners, campaigns, subscriptions, affiliates, and payment.
- Notification Worker owns asynchronous delivery and delivery records.
- API Gateway owns edge authentication enforcement, rate limiting, routing,
  correlation IDs, and public response policy; it owns no domain behavior.

Every service remains modular internally. The first web walking skeleton runs
Web, Gateway, Core Trip, Geo Location, and Notification Worker. Social Community
and Monetization remain present but are not required to run.

Data ownership follows the bounded contexts even while services share one
Supabase/PostgreSQL cluster. Cross-context writes and business joins are
prohibited. Services communicate through versioned HTTP or event contracts.

## Alternatives considered

- Fifteen fine-grained services: rejected because transaction, deployment,
  observability, and local-development costs exceed current product evidence.
- One deployable modular monolith: viable for product speed, but rejected as the
  target because geo and background delivery already have materially different
  workloads and independent scaling is an explicit project goal.
- One service per database table: rejected because tables are not bounded
  contexts.

## Consequences

- The project retains meaningful microservice learning and isolation.
- Local and production operations still require distributed-system discipline.
- Not every bounded context must be deployed before a feature uses it.
- Cross-service changes require contracts and may be eventually consistent.
- A service can only be split or merged through a new ADR supported by measured
  load, reliability, team ownership, security, or deployment evidence.

## Migration

The existing six app directories already match this decision. Generated
scaffolding will be replaced incrementally by vertical slices. No additional
service directory will be created for the first milestone.
