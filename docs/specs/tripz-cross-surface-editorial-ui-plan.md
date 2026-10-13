# Tripz Cross-Surface Editorial UI — Implementation Plan

## Architectural boundaries

- Remain entirely within `web/` presentation components, layouts, route wrappers, and visual test coverage.
- Keep server actions, API clients, data types, Supabase adapters, route protection, and all backend services unchanged.
- Reuse existing `components/ui`, feature components, and route layouts. Add only presentation-level shared primitives when repetition is demonstrated across at least two route groups.

## Visual-system approach

1. Establish an application-wide token layer for common neutral surfaces, ink, orange action intent, rules, radii, typography, focus rings, and elevation.
2. Keep the Landing Page’s editorial orange palette route-scoped where needed, while aligning shared components to compatible neutral/action tokens.
3. Build shared responsive patterns rather than global overrides: page header, shell navigation, data table/list, utility panel, empty/error state, and form-field affordances.
4. Preserve map-first planner layout and task density; do not apply marketing composition to operate surfaces.

## Delivery phases

### Phase 1 — Shared foundation and public/auth surfaces

- Audit and unify global typography/font loading, color variables, focus visibility, reduced-motion, and responsive primitives.
- Update public explore/trip detail and authentication presentation to the established editorial language.
- Preserve Landing Page’s completed route-local treatment and prevent global changes from regressing it.

### Phase 2 — Traveler application surfaces

- Update main shell navigation and shared UI components (`Navbar`, `PageHeader`, cards, fields, feedback states).
- Update trip list/detail/new, planner/editor, invitations, feed, profile/billing, and memory views.
- Validate the creation, planning, invite, profile, and community journeys against existing E2E coverage.

### Phase 3 — Partner and admin operational surfaces

- Update partner/admin shell navigation, headers, tables, filters, cards, forms, empty/error states, and responsive mobile rails.
- Maintain higher scan density and role-specific information hierarchy; do not alter authorization or data operations.

### Phase 4 — Cross-surface hardening and QA

- Audit target viewports, keyboard paths, focus states, semantic landmarks, contrast, loading/error/empty states, link destinations, and overflow.
- Run typecheck, lint, build, affected unit tests, and public/guest/journey/accessibility E2E suites.
- Capture desktop/tablet/mobile evidence per phase and correct verified defects in bounded batches.

## Testing strategy

- Add/extend route-focused Playwright coverage for navigation, role shells, responsive menus, primary CTAs, and critical existing workflows.
- Test all required viewport widths in the browser for public and shell-level regressions; test representative inner views per role.
- Use production build verification at the final phase; never claim unavailable performance metrics or external-service outcomes.

## Rollout constraints

- Changes are divided by route group so each phase can be independently reviewed and verified.
- No schema migration, API endpoint, dependency, or authorization change is needed.
- Existing dirty/unrelated worktree changes remain outside this work unless explicitly brought into scope.
