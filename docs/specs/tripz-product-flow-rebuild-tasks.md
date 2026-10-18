# Tripz Product Flow Rebuild — Tasks

## 0. Decisions and baseline

- [ ] Review and approve the specification, especially canonical routes and the
  five-role capability model.
- [ ] Decide the first production vertical slice: recommended Slice 1 only.
- [ ] Record route compatibility redirects and user-facing 401/403/404 policy.
- [ ] Establish staging Supabase, hosted Redis/BullMQ, provider test keys and
  disposable USER, trip OWNER/EDITOR/VIEWER, PARTNER/MODERATOR/ADMIN fixtures.
- [ ] Baseline current OpenAPI, migration status, route inventory and E2E suite.

## 1. Slice 0 — authorization and contracts

- [ ] Write role/capability matrix and authorization test matrix.
- [ ] Add immutable migration for platform-role expansion and audit records.
- [ ] Implement capability resolver in Gateway/owning services; remove exact
  role checks where capability checks are required.
- [ ] Add standard unauthorized, forbidden and concealed-not-found responses.
- [ ] Publish OpenAPI schemas/error contracts for clone, public trip and planner
  routes before controllers are written.

## 2. Slice 1 — discovery → clone → planner

- [ ] Specify Core Trip publication, template and clone invariants.
- [ ] Add trip-schema migration and repository/domain tests.
- [ ] Implement idempotent clone command and `TripCloned` outbox event.
- [ ] Create public-trip/read-model query and enforce public/unlisted/private
  visibility.
- [ ] Add Geo-backed explore filters, pagination and marker projection.
- [ ] Build `/dashboard`, `/planner/new`, canonical `/planner/:id` and legacy
  redirect compatibility.
- [ ] Make landing, explore and public trip consume only live/seeded records.
- [ ] Add accessible login gate with safe return and authenticated clone action.
- [ ] Run guest/owner/editor/viewer/unrelated-user E2E matrix.

## 3. Slice 2 — collaboration

- [ ] Finish stop order/move conflict handling and UI recovery.
- [ ] Implement invitation lifecycle/outbox/delivery retry and revoke policy.
- [ ] Add share visibility controls and audit log.
- [ ] Implement `/road/:id` desktop handoff and mobile route contract.

## 4. Later slices

- [ ] Slice 3: consented active-trip tracking, completion, memory, photos and
  expenses.
- [ ] Slice 4: community/profile/follow/collection/report/moderation.
- [ ] Slice 5: partner application/listings/approval/admin capability console.
- [ ] Slice 6: payment/order/webhook/travel-book fulfillment.

## 5. Quality gate for every slice

- [ ] Runtime schemas and OpenAPI updated.
- [ ] Migration is forward-only, tested from clean DB and staged remotely.
- [ ] Authorization/RLS matrix and idempotency tests pass.
- [ ] Browser E2E verifies loading, empty, error and permission states.
- [ ] Observability, correlation IDs, retries and dead-letter behavior verified.
- [ ] `pnpm` typecheck, tests, build and `git diff --check` pass.
