# Tripz Cross-Surface Editorial UI — Specification

## Objective

Bring every Tripz frontend surface into one coherent warm editorial visual language, derived from the approved landing page: off-white paper surfaces, charcoal typography, warm orange for high-priority actions and route emphasis, deliberate whitespace, and clear Vietnamese road-travel context.

## Scope

The work covers all current frontend route groups:

- Public: explore, public trip detail, and landing-adjacent public surfaces.
- Authentication: login.
- Main traveler app: trips, trip detail/new, planner and planner detail, invitations, feed, profile, billing, and memories.
- Partner portal: overview, analytics, campaigns, reviews, billing, and shared partner shell.
- Admin portal: overview, moderation, partners, affiliates, finance, settings, and shared admin shell.

## Product behavior that must remain unchanged

- All existing routes, auth guards, API calls, Supabase integration, mutations, persisted data, role boundaries, and domain workflows remain unchanged.
- Existing links, forms, validation, loading, empty, error, and authorization states remain functional and truthful.
- No unverified metrics, fabricated service claims, decorative controls, or placeholder actions are introduced.
- Existing Vietnamese content remains Vietnamese; new interface copy is also Vietnamese.

## Experience requirements

1. Establish visual consistency across every route while respecting each surface’s task: public pages persuade and inspire; planner and traveler pages prioritize map and itinerary operations; partner and admin pages prioritize scanning and safe operation.
2. Use a shared visual foundation: warm off-white canvas, charcoal text, warm neutral rules, orange reserved for primary actions, confirmed states, and route emphasis.
3. Use responsive layouts that remain usable at 320, 375, 390, 430, 768, 1024, 1280, 1440, and 1920px, without horizontal overflow or inaccessible content.
4. Preserve minimum 44px mobile targets, visible keyboard focus, semantic landmarks and headings, meaningful alternative text, and reduced-motion support.
5. Standardize visual states for buttons, fields, navigation, tables/lists, panels, empty/loading/error states, and route/map overlays without turning operational interfaces into marketing layouts.
6. Keep application layouts task-first: no replacement of dashboard/planner utility with card-heavy promotional compositions.

## Acceptance criteria

- Every route group uses a consistent hierarchy, type scale, spacing rhythm, color intent, and interaction state vocabulary.
- Existing supported user journeys continue to route and behave as before.
- Screens at all target viewport widths have no horizontal scrollbar; navigation and primary actions are usable at each breakpoint.
- Public and app-wide navigation retain correct role-aware destinations; partner/admin controls remain clearly distinct from traveler controls.
- Lint, strict type checking, production build, relevant E2E suites, and available browser checks pass.
- A final visual audit identifies no unresolved P0/P1 usability, accessibility, responsive, or misleading-content issues.

## Non-goals

- Backend, database, API, authentication, authorization, data model, or business-rule changes.
- New dependencies or a new frontend framework.
- New product features, fabricated analytics, or rewriting established factual travel content.
