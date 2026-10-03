# ADR-0004: LocationIQ for the staging geo provider

**Status:** Accepted

**Date:** 2026-10-03

## Context

The staging deployment needs real place search and route previews. VietMap is
configured with a placeholder key and cannot satisfy this acceptance gate. The
demo has no provider budget. The Geo Location Service already isolates provider
responses behind an adapter and exposes provider-independent contracts.

## Decision

Use LocationIQ's server-side Search and Directions APIs for staging.

- Keep the browser calling only the Road Trip API Gateway. The LocationIQ key is
  supplied to Geo Location Service through Infisical as `LOCATIONIQ_API_KEY`.
- Use `https://us1.locationiq.com` by default. Search returns normalized place
  snapshots; directions requests ask for GeoJSON geometry.
- Map `car` and `motorcycle` product modes to LocationIQ's `driving` profile.
- Preserve the existing timeout, one transient retry, circuit breaker, Redis
  cache, metrics, and stable `PLACE_PROVIDER_UNAVAILABLE`/`ROUTE_UNAVAILABLE`
  errors.

## Alternatives considered

- **VietMap:** retained as a future commercial option, but its unavailable key
  blocks the zero-cost staging demo.
- **OpenFreeMap:** supplies map tiles only; it does not meet search and routing
  requirements.
- **Client-side provider calls:** rejected because the key and provider errors
  would be exposed to browsers and bypass service resilience controls.

## Consequences

- Staging needs one new Infisical secret: `LOCATIONIQ_API_KEY`.
- The free provider has quota and coverage limits. A provider outage preserves
  saved itineraries and produces the existing retryable user-facing failure.
- Revisit the provider before commercial production usage, based on cost,
  Vietnam coverage, SLA, and product transport-mode requirements.
