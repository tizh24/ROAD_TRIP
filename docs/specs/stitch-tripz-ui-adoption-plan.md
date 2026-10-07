# TripZ Stitch UI Adoption - Implementation Plan

**Status:** Planned, not approved for implementation  
**Specification:** `./stitch-tripz-ui-adoption-spec.md`  
**Scope:** UI/UX redesign in `web/` only

## 1. Delivery strategy

Use the Stitch project as the primary visual reference while treating the existing Next.js routes, client data contracts and role guards as immutable product boundaries. Build the redesign in vertical UI slices so every visual change preserves a working user journey.

The implementation will extend the current token layer and shared primitives first, then move through public, traveler, role-based and hardening surfaces. Existing generated Stitch HTML is reference material only. It will not be copied into production.

## 2. Design direction

**Design read:** Trip-planning product for Vietnamese road travelers, with a map-first functional language and a restrained editorial travel character.

| Dial | Planned value | Reason |
| --- | ---: | --- |
| Design variance | 5 | Clear hierarchy and varied editorial composition, without making planning workflows unpredictable |
| Motion intensity | 3 | Responsive feedback and state transitions only; safe for utility-focused map and form flows |
| Visual density | 6 | Planner, partner and admin surfaces need readable operational density; public travel surfaces remain more spacious |

Taste Skill will be used selectively as an audit gate for public/editorial surfaces. It will not force landing-page conventions onto planner, map, partner or admin workflows.

## 3. Foundation and token plan

1. Replace the current warm atlas tokens with semantic TripZ tokens derived from Stitch: warm surface, emerald primary, navy structural, amber route attention, semantic success/warning/error, rule/border, elevation and map-overlay tokens.
2. Load Be Vietnam Pro for display/headings and Plus Jakarta Sans for controls/body through the existing Next font boundary; retain Vietnamese-safe fallback fonts.
3. Normalize spacing, radii, buttons, fields, focus rings, disabled states, skeletons and feedback states.
4. Preserve reduced-motion behavior and add explicit dark-mode token handling only if the existing product supports a global theme preference. Do not introduce section-level theme switches.
5. Audit shared components under `src/components/ui/` before adding primitives; evolve rather than duplicate `Navbar`, `CTAButton`, `PageHeader`, `FeedbackState`, `ConfirmDialog`, `BottomSheet`, `SearchBar`, map markers and badges.

## 4. Route and screen adoption plan

### A. Public and identity

| Route | Reference | Planned outcome |
| --- | --- | --- |
| `/` | Stitch Landing Page | Cinematic TripZ landing with direct create/explore paths, real route data only, and editorial travel imagery |
| `/explore` | Landing/discovery system | Route discovery index, useful search/filter handling, map/list composition and explicit empty/error states |
| `/trip/[id]` | TripZ visual system | Public itinerary narrative, route context and save/login path while retaining existing public-data controls |
| `/login` | Minimalist Login | Simple split or compact login surface with preserved callback and recovery states |

The alternate coastal/GPS landing concept informs map storytelling, but is not implemented as a competing public homepage.

### B. Traveler lifecycle

| Route or feature | Reference | Planned outcome |
| --- | --- | --- |
| `/trips` | My Trips | Journey index with filters, status, ownership and meaningful next actions |
| `/trips/new` | Create Trip | Progressive creation form with contextual route preview, validation and draft/failure behavior unchanged |
| `/trips/[tripId]` | Dashboard / My Trips | Trip overview organized around the next useful action, itinerary, members and route context |
| `/planner/[id]` and `/planner` | Desktop Planner + Mobile Planner | Desktop map canvas with itinerary rail; mobile full-map and itinerary sheet; retain existing edit, reorder and save behavior |
| Invitations and collaboration | Collaboration screen | Role clarity, member visibility, pending/expired/revoked feedback, without changing authorization rules |
| Save/retry/conflict states | Edge States | Consistent autosave, offline, failed-save and recovery presentation tied only to existing capabilities |

### C. On-the-road, memory and community

1. Use the mobile co-pilot screen as the reference for glanceable, route-first map controls where current product behavior supports it.
2. Evolve Memory into an ordered story/timeline using existing entries and privacy rules.
3. Evolve Community into image-led travel activity with real content and supported actions only.
4. Apply Taste Skill to storytelling hierarchy, imagery and copy audit, but not to dense interaction controls.

### D. Profile, partner and admin

1. Retheme profile/settings/billing using shared TripZ tokens, with privacy/payment states remaining explicit.
2. Retheme partner/admin shells with the same typography, color and interaction language, while preserving higher information density, tables, filters and approval flows.
3. Avoid forcing image-led or card-heavy public layouts onto operational pages. Use rules, grouped sections and reusable feedback/confirmation components instead.

## 5. Component architecture

- Keep `src/components/ui/` for product-agnostic primitives and shared states.
- Keep route/feature compositions inside the existing feature folders.
- Keep map layout and map controls in `src/features/trip-planning/components/`; no new map business logic is introduced.
- Isolate any client-side visual interaction to existing client components. Do not add continuous scroll listeners or state-driven animation loops.
- Reuse the existing icon family unless a replacement is deliberately chosen and applied consistently.

## 6. Responsive and state matrix

| Concern | Desktop | Mobile |
| --- | --- | --- |
| Planner | Split map and itinerary rail | Full map with multi-snap itinerary sheet |
| Discovery | Index/map or editorial grid | One-column route index with map drawer/fullscreen view |
| Forms | Context panel beside form when useful | Single-column form, persistent progress and accessible actions |
| Partner/admin | Dense tables and utility panels | Responsive rows, detail drawers and intentional horizontal overflow only when essential |

Every modified surface will cover loading, empty, error/retry, permission and destructive-confirmation states where applicable.

## 7. Guardrails

- Do not change route slugs, form field names/order, role checks, backend responses, analytics event identifiers or Supabase behavior without a separate approved specification.
- Do not publish fake metrics, fake trip data or unavailable functionality as live product behavior.
- Do not add external dependencies without verifying `web/package.json` and documenting the reason.
- Avoid generic AI visual patterns: purple glows, decorative glass, repeated equal-card grids, fake dashboards, invented testimonials and generic travel copy.
- Avoid pixel-copying generated Stitch HTML. Reimplement the design intent using accessible React components and local token conventions.

## 8. Verification plan

1. Validate each changed route at 320px, 390px, tablet, 1280px and 1440px widths.
2. Verify keyboard order, focus visibility, screen-reader labels, touch targets, contrast and reduced-motion fallback.
3. Run `npm run lint`, `npm run typecheck`, `npm test` and targeted Playwright coverage from `web/` after implementation.
4. Recheck public, owner/editor/viewer, partner and admin access boundaries after UI changes.
5. Use a Taste Skill pre-flight review for public/editorial screens and a component/state consistency review for product/operational screens.

## 9. Implementation prerequisites

- Confirm whether the current branch's untracked `docs/TRIPZ_EDITORIAL_UI_BLUEPRINT.md` is the intended additional visual source; it will be preserved and not overwritten.
- Create a task breakdown only after this plan is approved.
- Do not begin code changes until the task breakdown is accepted.

