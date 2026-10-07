# Jadoo-Inspired Public Landing — Specification

**Version:** 0.1.0  
**Status:** Draft for approval  
**Created:** 2026-10-08  
**Target:** `web/` public home route (`/`)

## 1. Outcome

Replace the current TripZ public-home UI and its public navigation layout with
a responsive Vietnam-localized travel landing page whose information hierarchy
and visual character are inspired by the supplied Jadoo reference. The result
must present Road Trip as a travel-planning product, while preserving its own
brand, copy, routes, authentication, and accessible behavior.

## 2. Scope

The new public home contains these sections in order:

1. A lightweight header with Road Trip wordmark, destination/product links,
   sign-in and a clear primary action.
2. Hero: travel promise, brief value statement, primary “start planning” CTA,
   secondary demo/explore action, and travel imagery/composition.
3. Four service/value cards: route planning, collaborative trips, safety-ready
   preparation, and trip memories/community.
4. Featured destination cards that route to existing discovery/trip flows.
5. A three-step “plan your trip” section with a visual trip-preview card.
6. Social proof/testimonial area and partner/community logo treatment.
7. Newsletter/updates sign-up panel with a safe non-persisting fallback until
   a subscription backend is available.
8. Footer with product, company and support links.

The landing page must be responsive at 320px through large desktop widths,
use Vietnamese-first content, work with keyboard navigation, and honor reduced
motion preferences.

## 3. Required behavior

- Existing action destinations remain valid: planning CTA leads to `/trips/new`
  (authentication protection remains authoritative); exploration leads to
  `/explore`; sign-in leads to `/login`.
- Header links scroll to their matching sections where a section exists, or
  link to the relevant existing route.
- Mobile navigation opens/closes accessibly, traps no focus, and collapses
  after navigation.
- Destination cards and CTAs have meaningful text alternatives and obvious
  hover/focus/pressed states.
- Newsletter submission validates an email format client-side. It must state
  that signup is unavailable or show a non-deceptive success state only when a
  real endpoint exists; it must never imply data was stored otherwise.
- Decorative illustrations do not distract screen readers. Content images have
  contextual alt text.

## 4. Visual direction

- Maintain Road Trip identity (no Jadoo name, logo, copyrighted imagery, or
  copy) while using the reference’s airy white/cream field, navy display type,
  coral/yellow accents, rounded cards, travel-photo cards, generous vertical
  rhythm, and small playful decorative flourishes.
- Use a display serif only for editorial headings and a legible sans-serif for
  body/UI. All text retains WCAG 2.2 AA contrast.
- Images must be locally licensed/owned or sourced from a permitted remote
  image host already supported by Next configuration; do not copy images from
  the reference.

## 5. Explicitly preserved / excluded

- Preserve public routes, auth middleware, Supabase behavior, feature APIs,
  authenticated traveler screens, partner portal, admin portal, and their
  existing role-specific shells.
- Do not add a database schema, API endpoint, tracking event, paid-product
  claim, video demo, or newsletter persistence in this UI replacement.
- The phrase “replace all old UI/layout” is interpreted for this iteration as
  the public home page and the public header/footer only. The supplied visual
  reference does not specify authenticated, partner, or admin surfaces; those
  would require their own specifications before replacement.

## 6. Acceptance criteria

1. Visiting `/` presents all eight sections, replaces the current road-trip
   route/checklist layout, and no longer renders the existing global navbar on
   this landing page.
2. Home-page actions reach `/trips/new`, `/explore`, and `/login` correctly.
3. Navigation, images, cards, CTA controls, and form controls are keyboard
   usable with visible focus states and semantic labels.
4. At 320px, 768px, and desktop widths, content remains readable without
   horizontal scrolling or clipped interactive controls.
5. The implementation uses Road Trip branding/content and permitted assets;
   it does not reproduce Jadoo assets, copy, or trademarked branding.
6. Linting, type checking, existing unit tests, and a focused home-page E2E
   check pass.
