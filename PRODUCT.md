# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Independent road travelers in Vietnam planning and driving multi-day road trips (motorcycle, car, camper), navigating scenic routes, stopovers, and varying road/connectivity conditions.

## Product Purpose
Tripz helps road travelers in Vietnam find inspiration, plan realistic multi-day itineraries, coordinate navigation and stops while on the road, and preserve their travel memories post-trip. It replaces fragmented ad-hoc tools (scattered map pins, spreadsheets, chat notes) with an integrated, map-first editorial road atlas.

## Positioning
An editorial, map-centric road atlas tailored specifically for Vietnamese routes and road conditions—pairing cinematic travel storytelling with precise, glanceable waypoint utility rather than generic SaaS trip grids or synthetic AI travel fluff.

## Operating Context
- **Pre-trip**: Desktop and mobile web research, day-by-day waypoint sequencing, route discovery, and schedule balancing.
- **On-the-road**: Mobile viewport execution, glanceable next stops, responsive map canvas, offline/intermittent connectivity awareness, and quick-access emergency or rest-stop actions.
- **Post-trip**: Preserving journey memories, route highlights, and editorial community sharing.

## Capabilities and Constraints
- Map-first split layout for desktop planning and bottom-sheet itinerary overlays for mobile web.
- Multi-day trip creation, stop reordering, distance/duration estimates, and waypoint state management.
- Vietnamese-safe typography with full diacritics support (`Be Vietnam Pro` and `Plus Jakarta Sans`).
- Warm editorial tone and tactical palette (off-white canvas, charcoal ink and Tripz orange route highlights).
- Existing Next.js routes, Supabase authentication, and backend service contracts remain preserved.
- High-contrast accessibility (WCAG 2.2 AA), 44px touch targets on mobile, and reduced-motion compliance.

## Brand Commitments
- Name: Tripz (Editorial Road Atlas).
- Visual Identity: "Editorial Road Atlas" aesthetic—quiet confidence, sun-worn paper, warm orange route marks, real places and precise utility.
- Strict anti-patterns: No generic AI badges or purple gradients, no decorative glassmorphism, no fake metrics or placeholder cards, no unreadable full-bleed photo overlays.

## Evidence on Hand
- Architecture constitution in `docs/architecture/constitution.md`.
- UI Blueprint in `docs/TRIPZ_EDITORIAL_UI_BLUEPRINT.md`.
- Stitch UI Adoption Specification in `docs/specs/stitch-tripz-ui-adoption-spec.md`.
- Working Next.js web application codebase in `web/`.

## Product Principles
1. **Map-First Utility**: The map is the primary decision canvas; interface controls are quiet, minimal floating layers.
2. **Editorial Minimalism**: High typographic discipline, deliberate whitespace, numbered steps, and clean dividers over cluttered SaaS cards.
3. **Vietnamese Road Reality**: Designed for actual Vietnamese road trip conditions—mountain passes, coastal highways, variable signal, and realistic travel pacing.
4. **Vertical Slices & Truth**: Every surface must link to genuine actions and persisted trip data; no fake metrics, placeholder CTAs, or synthetic fluff.

## Accessibility & Inclusion
- Target standard: WCAG 2.2 AA.
- High text-to-background contrast across light and dark surfaces.
- Touch targets strictly ≥ 44px on mobile viewports.
- Keyboard navigation and visible focus rings on all interactive map and itinerary controls.
