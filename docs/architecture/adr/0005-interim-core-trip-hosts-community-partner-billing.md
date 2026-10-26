# ADR-0005: Core Trip temporarily hosts community, partner and billing

**Status:** Accepted (time-boxed exception, constitution §11.2)

**Date:** 2026-10-27

## Context

Product-flow Slices 3–6 shipped community, partner and billing/travel-book
behavior inside `core-trip-service`. `social-community-service` and
`monetization-service` remain unmodified Nest scaffolds and are not deployed.
The code queries `community_schema`, `partner_schema`, `billing_schema`,
`public.user_profiles` and `trip_schema`, including cross-schema joins, which
conflicts with ADR-0001 and constitution §3.1 and §4.2.

## Decision

Keep these capabilities in Core Trip until the first measured need to split
them. The Gateway remains the only public entry point and enforces platform
capabilities; Core Trip re-checks the forwarded role.

## Compensating controls

- All tables stay in separate schemas; new code must not add further
  cross-schema writes.
- Profiles and role changes use `public.user_profiles`; privileged changes are
  recorded in `public.platform_audit_logs`.
- Repositories are isolated per context so they can move without API changes.

## Exit criteria and review date

Extract to the owning services (or amend ADR-0001) before partner payouts or
real payment-provider settlement go live, or by 2027-01-31, whichever is first.
Owner: project maintainer.
