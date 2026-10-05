# Web Experience Redesign — Technical Plan

**Version:** 0.2.0  
**Status:** Ready for task breakdown  
**Specification:** `./spec.md`  
**Target:** `web/` Next.js application  
**Scope:** UI/UX redesign only; Google Stitch is explicitly out of scope.

## 1. Delivery approach

Deliver a shared visual system first, then implement vertical UI slices in the
same order people experience the product: public discovery and identity, trip
planning, on-the-road, memory/community, profile/billing, partner and admin.
Each slice remains responsive, accessible and contains loading, empty, error,
permission and destructive-action states.

The repository is the source of truth for both design tokens and production
code. The redesign is implemented directly as reusable React components.

## 2. Information architecture

| Surface | Routes |
| --- | --- |
| Public | `/`, `/explore`, `/trip/[id]`, `/login` |
| Traveler | `/trips`, `/trips/new`, `/trips/[tripId]`, `/planner`, `/planner/[id]`, `/memory/[id]`, `/feed`, `/profile`, `/profile/settings`, `/profile/billing`, `/trip-invitations/[token]` |
| Partner | `/partner`, `/partner/campaigns`, `/partner/analytics`, `/partner/reviews`, `/partner/billing` |
| Admin | `/admin`, `/admin/moderation`, `/admin/partners`, `/admin/affiliates`, `/admin/finance`, `/admin/settings` |

## 3. Design system

- Token layer in `web/src/app/globals.css`: cream/sand neutral surfaces,
  burnt-orange primary, forest-green secondary, ochre tertiary, semantic status
  colors, elevation, radius, spacing and responsive typography.
- Use a friendly rounded heading scale and a readable sans body font loaded
  through the existing Next.js font boundary; retain Vietnamese-safe fallbacks.
- Reusable primitives under `web/src/components/ui/`; travel-specific cards,
  map overlays and timelines live in their relevant feature folders.
- Preserve semantic HTML, keyboard navigation, focus rings, reduced motion and
  contrast at WCAG 2.2 AA.

## 4. Shared UI architecture

- Refactor public and traveler navigation into responsive desktop navigation
  with a mobile drawer/bottom-navigation treatment where route context needs it.
- Keep partner and admin shell ownership separate, but standardize the
  responsive sidebar/header behavior, content containers and page headers.
- Extend existing `web/src/components/ui/` primitives rather than duplicate
  buttons, fields, cards, drawers, sheets, dialogs, skeletons or feedback
  states within each page.
- Feature folders compose those primitives: trip planning owns itinerary/map
  views, memory/community own their timelines/feed cards, and partner/admin own
  their dashboard compositions.

## 5. Implementation slices

### A. Foundation and navigation

1. Consolidate colors, typography, spacing, radius, shadows, state colors and
   map-overlay tokens in `globals.css`.
2. Rebuild Navbar and each role shell; add common page header, breadcrumb,
   feedback, confirmation and responsive container patterns.
3. Check navigation at 320px, tablet and desktop widths.

### B. Public and identity

1. Rebuild landing, explore and public trip detail as image-led discovery flows.
2. Rebuild login/callback/access states without changing Supabase behavior.
3. Cover empty, search failure, inaccessible and unauthenticated states.

### C. Trip planning and collaboration

1. Rebuild My Trips, create-trip wizard and trip overview as card-based flows.
2. Rebuild editor, day navigation, search and stop components.
3. Make Planner map-centric: desktop itinerary/map split; mobile itinerary-first
   with fullscreen or drawer map; retain save, retry and conflict behavior.
4. Rebuild invitation and member controls for owner, editor, viewer and
   outsider states.

### D. On-the-road, memory and community

1. Rework map views as full-canvas maps with accessible floating route/progress
   panels.
2. Rebuild Memory as an ordered travel story timeline, including empty and
   private/share states.
3. Rebuild Community as a travel-activity feed with comment, save, report and
   moderation affordances.

### E. Profile, partner and admin

1. Refresh profile, settings and billing with clear privacy/payment boundaries.
2. Refresh partner overview, campaigns, analytics, reviews and billing with
   responsive cards/tables, filters and action placement.
3. Refresh admin overview, moderation, partners, affiliates, finance and
   settings for dense operational work, permission visibility and destructive
   confirmation.

### F. Hardening

1. Update component/E2E coverage for the redesigned primary and role-based
   journeys.
2. Review keyboard order, focus, contrast, zoom and reduced motion.
3. Run lint, typecheck, unit tests and affected Playwright tests.

## 6. Required state matrix

| State | Required behavior |
| --- | --- |
| Loading | Layout-preserving skeleton or progress indicator; interaction stays safe |
| Empty | Explains why no data exists and provides one valid next action |
| Error | Plain-language recovery and retry; never destroys entered data |
| Permission | Explains access level and exposes only permitted actions |
| Offline/async | Shows existing save/sync behavior when supported |
| Destructive | Requires confirmation and reports the final result |

## 7. Boundaries and safety

- UI work does not invent backend capabilities: unavailable location, payment,
  moderation or social actions display deliberate unavailable/error states.
- Existing auth, authorization and API contracts remain authoritative.
- Do not expose location or payment information in client logging, analytics or
  public page states.
- Every modified screen is checked at mobile and desktop breakpoints.

## 8. Verification

- `npm run lint`, `npm run typecheck`, `npm test`, and affected Playwright tests
  in `web/`.
- Manual keyboard, focus, reduced-motion and color-contrast review.
- Public, owner/editor/viewer, partner and admin route checks verify layout
  does not weaken existing route protection.

## 9. Deferred decisions

- Native mobile redesign remains outside this plan.
- New social, payment, GPS or moderation backend capabilities are not invented
  by the UI; unavailable functions receive deliberate presentation states.
