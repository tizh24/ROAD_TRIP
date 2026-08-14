# ADR-0003: PostgreSQL transactions with service authorization and RLS

**Status:** Accepted

**Date:** 2026-08-14

## Context

Creating a trip must atomically create the trip, owner membership, generated
days, idempotency result, and outbox event. A sequence of independent Supabase
REST calls cannot guarantee that atomic boundary. The backend may also use
privileged credentials that bypass Row-Level Security, so RLS alone cannot be
the service authorization model.

## Decision

- Supabase Auth remains the identity provider.
- Core Trip accesses PostgreSQL through a transaction-capable persistence
  adapter for aggregate commands.
- Supabase CLI SQL files are the only schema migration source.
- ORM or query libraries, if introduced, may map/query data but must not create a
  competing migration history.
- API Gateway verifies external identity; each owning service verifies trusted
  identity context and authorizes access to its own resources.
- RLS remains defense in depth and protects supported user-scoped/direct access.
- Privileged backend paths must pass explicit service authorization before a
  repository command.
- Each context uses its own schema and least-privilege database role.
- Domain models, persistence rows, public DTOs, provider payloads, events, and
  read models remain distinct.

## Alternatives considered

- Supabase REST client only: rejected for multi-record aggregate/outbox
  transactions unless all behavior is hidden in database RPC functions.
- Database RPC for every command: viable but rejected as the default because it
  moves evolving domain behavior into stored procedures and complicates unit
  testing and portability.
- RLS only with no service authorization: rejected because privileged service
  credentials can bypass RLS and domain permissions exceed row predicates.
- Separate database cluster per service immediately: deferred for cost and
  operational simplicity; logical schema ownership is mandatory now.

## Consequences

- Atomic aggregate and outbox writes are possible.
- Database connection management and transaction integration tests are required.
- Authorization logic and RLS policies must be tested against the same permission
  matrix to prevent drift.
- Cross-context foreign keys and business joins are avoided so schemas can move
  to separate clusters later.

## Migration

Existing applied migrations remain immutable. New corrective migrations add
constraints, versions, ownership, outbox, invitation, and notification tables.
A clean database reset in CI must prove the complete migration chain.
