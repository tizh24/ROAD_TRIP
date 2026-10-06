# Web Experience Redesign — Implementation Tasks

**Version:** 0.1.0  
**Status:** Ready for implementation  
**Plan:** `./plan.md`  
**Constraint:** UI-only redesign; preserve existing routes, authorization, API calls and domain behavior.

## Phase 0 — Baseline and safety

- [x] T0.1 Record screenshots and run the existing web lint, typecheck, unit and E2E suites to establish a baseline.
- [x] T0.2 Review current route guards, role layouts and API-bound views before touching their presentation.
- [x] T0.3 Read the installed Next.js guidance in `web/node_modules/next/dist/docs/` before implementation, per `web/AGENTS.md`.

Baseline evidence (2026-10-05): lint, typecheck and 11 unit/API/analytics tests
passed. Local Playwright run passed 8 tests; 2 backend-dependent journey tests
were intentionally skipped. Login screenshots were captured at desktop and
mobile widths under `web/test-results/`.

## Phase 1 — Design foundation

- [x] T1.1 Consolidate cream/sand, burnt-orange, forest-green, ochre and semantic status tokens in `src/app/globals.css`.
- [x] T1.2 Define responsive type, spacing, radius, shadow, layer and map-overlay tokens; remove conflicting duplicate visual rules.
- [x] T1.3 Preserve/strengthen focus visibility, reduced motion, skip link and Vietnamese-safe typography.
- [x] T1.4 Add shared responsive content container and page-header patterns.
- [x] T1.5 Add reusable loading, empty, error/retry, permission and destructive-confirmation components.

Foundation evidence (2026-10-05): added `PageHeader`, `FeedbackState` and
`ConfirmDialog`; `npm run lint` and `npm run typecheck` pass.

## Phase 2 — Navigation and role shells

- [x] T2.1 Rebuild the public/traveler Navbar for desktop and mobile while preserving all current destinations and auth states.
- [x] T2.2 Update public and main layouts to use the shared shell, page structure and keyboard skip target.
- [x] T2.3 Update partner header/sidebar for collapsible mobile navigation and consistent dashboard spacing.
- [x] T2.4 Update admin header/sidebar with the same responsive behavior while retaining admin-only navigation.
- [x] T2.5 Test navigation, focus order and overflow at 320px, tablet and desktop widths.

Navigation evidence (2026-10-05): added `navigation-responsive.spec.ts`;
public navigation has no horizontal overflow and its mobile menu opens at 375px
and 768px. The desktop check passed at 1440px.

## Phase 3 — Public discovery and identity

- [x] T3.1 Redesign the landing page as a visual Road Trip discovery page with hero, destination/trip cards, trust content and clear create/explore actions.
- [x] T3.2 Redesign ExploreView with search, filter chips, list/map controls, empty/no-result and failed-search states.
- [x] T3.3 Redesign the public trip page with cover image, day-by-day itinerary, route context, author/social proof and clone/save entry points.
- [x] T3.4 Redesign LoginView, callback feedback and unauthenticated/access-denied states without changing authentication behavior.
- [x] T3.5 Verify public pages do not expose private trip, location, member or payment data.

Public evidence (2026-10-05): removed public copy that presented unavailable
GPS and split-bill capabilities as active; public clone action now enters the
real login flow. Lint and typecheck pass.

## Phase 4 — Trip planning and collaboration

- [x] T4.1 Redesign TripListView and TripCard with image-led cards, ownership/status signals, search/filter space and useful empty states.
- [x] T4.2 Redesign CreateTripForm into a clear progressive journey while retaining existing validation and submit safeguards.
- [x] T4.3 Redesign TripDetailView and TripEditorView around cover, trip facts, progress, itinerary and contextual actions.
- [x] T4.4 Redesign day tabs, PlaceSearch, StopRow and stop cards for touch-friendly reorder, move and delete affordances.
- [x] T4.5 Redesign RouteMap, MapPanel and SaveStatus into the map-centric planner: split desktop layout and mobile map drawer/fullscreen.
- [x] T4.6 Redesign CollaborationPanel and invitation landing for owner, editor, viewer, pending, expired and revoked states.
- [ ] T4.7 Verify create → add stops → route → save → reload and invitation role gates against the existing E2E journeys.

## Phase 5 — On-the-road, memory and community

- [x] T5.1 Rework shared map components into a full-canvas on-the-road presentation with floating, accessible route/progress controls.
- [x] T5.2 Redesign TripMemoryView as a chronological story/timeline with media cards, privacy labels and empty/share states.
- [x] T5.3 Redesign CommunityFeedView, LandingPage community elements and feed cards as activity-led travel social content.
- [x] T5.4 Ensure comment, save, report and moderation affordances remain consistent with currently supported actions only.
- [ ] T5.5 Test map and timeline behavior at mobile and desktop widths, including no-map/no-memory/error fallback states.

## Phase 6 — Profile and monetization

- [ ] T6.1 Redesign UserProfileView with identity, public travel proof, edit affordances and privacy-aware sections.
- [ ] T6.2 Redesign profile settings with grouped account, notification and location/privacy controls; retain existing form behavior.
- [ ] T6.3 Redesign billing with plan, payment and invoice states that distinguish unavailable/demo data from live data.
- [ ] T6.4 Redesign partner overview with contextual KPIs, recent activity and quick actions.
- [ ] T6.5 Redesign partner campaigns, analytics, reviews and billing panels for responsive cards/tables, filters and action placement.
- [ ] T6.6 Verify partner routes preserve their existing access boundaries.

## Phase 7 — Admin experience

- [ ] T7.1 Redesign the admin overview for scan-friendly KPIs, recent changes and operational shortcuts.
- [ ] T7.2 Redesign moderation flows with queue, content context, safe action hierarchy, empty queue and failure states.
- [ ] T7.3 Redesign partners, affiliates, finance and settings panels with dense readable tables/forms and responsive overflow handling.
- [ ] T7.4 Apply consistent confirmation and completion/error feedback to destructive administrative actions.
- [ ] T7.5 Verify all admin routes preserve role protection and do not reveal restricted operational data in UI fallbacks.

## Phase 8 — Quality gates and handoff

- [ ] T8.1 Add or update unit/component tests for shared states and changed interactive components.
- [ ] T8.2 Update Playwright coverage for public, trip-planning, role-gated and responsive journeys affected by the redesign.
- [ ] T8.3 Perform manual keyboard, focus, contrast, zoom and reduced-motion checks across all four surfaces.
- [ ] T8.4 Run `npm run lint`, `npm run typecheck`, `npm test` and targeted `npm run test:e2e` from `web/`; repair failures.
- [ ] T8.5 Update the task checklist with evidence/results and summarize changed routes/components for handoff.

## Sequencing rules

- Complete Phases 0–2 before changing individual product pages.
- Complete Phase 4 before Phase 5 because its map and trip primitives are reused.
- Phase 6 and Phase 7 may proceed after Phase 2, but are verified only in Phase 8.
- A task is complete only after its required UI states and applicable mobile/desktop checks are covered.
