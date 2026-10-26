# Road Trip Platform API Contract — Tasks

**Status:** Draft

## Phase 1: BFF auth, profile and truthful contracts

- [x] Add gateway configuration schema, validation, hosted example variables
  and deployment documentation for server-only Supabase credentials, cookie and
  CSRF settings.
- [x] Create Supabase Auth adapter with register/login/refresh/logout/password
  recovery/change and provider-error normalization.
- [x] Create cookie/session and CSRF/origin components; add unit tests for
  cookie flags, expiration, path/domain and rejected cross-origin mutations.
- [x] Extend authentication context with platform role/account status through a
  profile authorization adapter; preserve bearer authentication for non-browser
  clients.
- [x] Add immutable migration for platform-account audit records and any missing
  profile role/status constraints; regenerate database types.
- [x] Implement account/profile/admin controllers and service authorization;
  prevent self-role escalation and audit every privileged mutation.
- [x] Add rate-limit policies for unauthenticated auth endpoints without
  leaking whether an account exists.
- [x] Repair OpenAPI v1 schemas, security alternatives, all proxy paths and
  error/permission documentation; remove false idempotency claims.
- [x] Add route-to-OpenAPI and OpenAPI schema tests plus auth/role matrix tests.
- [x] Migrate the web auth/profile client to Gateway cookies; remove direct
  Supabase production-path calls and add browser E2E coverage.
- [ ] Run typecheck, lint, contract tests, API E2E and web production build;
  record hosted staging verification and rollout metrics.

> Progress 2026-10-27: only task 11 remains open (API E2E against a live stack, hosted
> staging verification and rollout metrics). Local gates passed: server lint/typecheck/test,
> web lint/typecheck/test/build and guest + BFF Playwright suites.
> The web no longer imports the Supabase client; recovery links land on `/auth/recovery`.

## Explicitly deferred: separate specifications required

> Superseded in practice by `docs/specs/tripz-product-flow-rebuild-spec.md`
> (Slices 3–6); see ADR-0005 for the interim service placement.

- [ ] Road-trip execution: check-in, expense and memory lifecycle/privacy.
- [ ] Community: profiles, posts, comments, reviews, social graph/moderation.
- [ ] Partner: organization, listing, campaign and analytics rules.
- [ ] Monetization: plan, invoice, affiliate, payment and verified webhook
  state machine.
- [ ] Media and notification: upload policy, retention, inbox and preferences.
