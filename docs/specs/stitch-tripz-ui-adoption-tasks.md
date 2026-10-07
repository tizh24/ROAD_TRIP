# TripZ Stitch UI Adoption - Tasks

**Plan:** `./stitch-tripz-ui-adoption-plan.md`  
**Status:** In progress

## Foundation

- [x] T1. Audit the current web token layer, font boundary and shared UI primitives.
- [x] T2. Apply the Stitch TripZ token, typography, focus, feedback and responsive foundation.
- [x] T3. Align public/traveler navigation and shared page composition with the new system.

## Public and identity

- [x] T4. Rebuild landing and discovery-facing public surfaces from the Stitch direction.
- [ ] T5. Rebuild login presentation and preserve auth/callback error behavior.

## Traveler

- [ ] T6. Refresh My Trips, create trip and trip overview compositions.
- [x] T7. Rebuild desktop/mobile planner chrome, itinerary/map hierarchy and save feedback without changing editor behavior.
- [ ] T8. Refresh collaboration/invitation and stateful feedback views.

## Remaining product surfaces

- [ ] T9. Refresh memory/community/profile surfaces using the editorial travel direction where appropriate.
- [ ] T10. Refresh partner/admin visual system for dense, utility-first operations.

## Verification

- [x] T11. Run lint, typecheck and focused tests; repair UI regressions.
- [x] T12. Record completion evidence and unresolved scope.

## Verification evidence

- `npm run lint` passes with two pre-existing `@next/next/no-img-element` warnings in LandingPage and ExploreView.
- `npm run typecheck` passes.
- `npm run test` passes: 11 tests across auth, trip-planning API, and analytics.
- `npm run build` passes. The legacy Next middleware deprecation warning remains outside this UI scope.

## Deferred scope

- T4-T6 and T8-T10 remain deliberately uncompleted: discovery, trip creation/overview, collaboration, memory/community, partner and admin screens require their own functional visual pass and responsive review.
