# Tripz Cross-Surface Editorial UI — Tasks

## 1. Foundation and Public/Auth

- [x] Inventory global tokens, shell styles, and repeated UI primitives.
  - Findings (2026-10-27): one token layer in `web/src/app/globals.css`; legacy `brand-*` names duplicated the palette with slightly different hex values; 12 off-palette hex literals in TSX (`#f2c369`, `#f4f6f3`, `#f7f1e8`, `#1d2a23`, `#0f1712`, …); native `<button>` (28 files), `<input>` (16), `<select>` (7), `<textarea>` (6) outside `components/ui`; 36 files use `text-primary` on light backgrounds (about 3:1, large/bold text only).
- [x] Define compatible shared visual tokens and accessibility states.
  - `--color-primary-strong` (#B84E1B) for solid action fills with white text; shadcn semantic variables mapped to DESIGN.md; `brand-*` aliased to canonical tokens; global `:focus-visible` ring and reduced-motion rules already in place.
- [ ] Refresh public explore/trip detail and login routes.
- [ ] Verify public/auth responsive behavior and journeys.

## 2. Traveler App

- [ ] Update main shell, navigation, page headers, and reusable feedback/form primitives.
- [ ] Refresh trips, planner, invitations, feed, profile, billing, and memories.
- [ ] Verify traveler routes and planning workflows.

## 3. Partner and Admin

- [ ] Update partner shell and five partner views.
- [ ] Update admin shell and six admin views.
- [ ] Verify operational layouts, tables/forms, and role navigation.

## 4. Quality Gates

- [ ] Run viewport matrix and interaction checks on each route group.
- [ ] Run lint, typecheck, build, and affected automated tests.
- [ ] Complete final accessibility/responsive audit and document residual risk.
