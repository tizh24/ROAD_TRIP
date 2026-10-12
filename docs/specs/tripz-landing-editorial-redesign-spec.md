# Tripz Landing Editorial Redesign — Specification

## Purpose

Replace only the public home route (`/`) with a premium Vietnamese road-trip editorial landing experience. It must help a first-time visitor understand Tripz, feel inspired by Vietnamese road travel, and start planning or exploring a route.

## Scope and constraints

- Scope is limited to the landing page component, its landing-local styling, and its route-specific E2E expectations.
- Preserve existing navigation destinations: `/login`, `/trips/new`, `/explore`, and `/feed`.
- Do not alter backend logic, APIs, database, authentication, shared application styles, or other routes.
- Use Vietnamese throughout. The header remains in normal document flow.
- The landing page uses a local warm editorial palette: orange `#E87535`, off-white `#FAF9F6`, charcoal `#1B1B1B`, and warm neutral rules.

## Experience requirements

1. A normal-flow navigation introduces Tripz, route links, login, planning CTA, and avatar affordance.
2. The opening composition is asymmetrical: copy and an integrated Đà Nẵng → Huế planner on the left; a cinematic road image with route data on the right.
3. A non-card statistics band follows the hero.
4. Core capability, featured itinerary, safety, and final CTA sections communicate planning intelligence, route discovery, shared costs, and confidence while avoiding repetitive card grids.
5. Content includes the specified Cung Di Sản Miền Trung itinerary, a five-point vehicle checklist, and emergency/offline support information.
6. Buttons and links remain actionable to existing supported destinations; local affordances are accessible by keyboard and have visible focus feedback.
7. Desktop, tablet, and mobile present the same information in an intentional sequence without horizontal overflow.

## Acceptance criteria

- At 1440px, the hierarchy reads as editorial travel, not SaaS: image-led hero, one dominant orange action, generous whitespace, and restrained panel count.
- At 390px, header controls, hero actions, planner, route data, checklist, and final CTA are readable and reachable with no overflow.
- The homepage header is not fixed or sticky.
- Existing non-home routes retain their existing global visual system.
- Typecheck, lint, and landing E2E checks pass after their assertions are updated for the new approved content.
