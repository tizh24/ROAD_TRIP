# Tripz UI Rebuild — Tasks

Spec: `./tripz-ui-rebuild-spec.md`. Plan: `./tripz-ui-rebuild-plan.md`.

## 0. Spec and housekeeping

- [x] Write spec, plan and tasks.
- [ ] Owner approves the spec. **(gate)**
- [ ] Mark the cross-surface, web-experience-redesign and Stitch checklists as superseded.

## 1. Direction

- [ ] Install taste-skill as a project skill and verify `draw.mjs`/`inspect.mjs` run (Node 22, Edge).
- [ ] Inventory the subject (8 to 12 Tripz-specific items).
- [ ] Write the landing argument (claim and proof per section).
- [ ] Draw three page directions and three app directions.
- [ ] Mock one screen per direction and present to the owner.
- [ ] Owner chooses a direction. **(gate)**
- [ ] Save the direction sheet in `docs/design/direction.md`; replace `DESIGN.md`.

## 2. Foundation

- [ ] Read the installed Next.js docs relevant to layouts, fonts and `next/image`.
- [ ] Rewrite tokens, fonts and base CSS from the chosen direction.
- [ ] Adapt existing Radix primitives to the new tokens.
- [ ] Add Sidebar, Card, Table, Breadcrumb, Dropdown Menu, Tooltip, Avatar, Popover/Calendar and Chart primitives (Radix).
- [ ] Port dashboard shell (sidebar, header, content frame, error boundary, loading) with Radix.
- [ ] Replace legacy shared components and delete dead code and `brand-*` tokens.
- [ ] Gate: typecheck, lint, build.

## 3. Landing

- [ ] Gather real photographs with credits (`assets.mjs`); store with `CREDITS.md`.
- [ ] Build sections from the argument; header, hero, content sections, newsletter, closing call to action, footer.
- [ ] Run `inspect.mjs`; screenshots at 320/768/1440; fix and re-look.
- [ ] Update `public-landing` and `navigation-responsive` e2e.

## 4. Shell and auth

- [ ] Login, signup, forgot, reset and recovery pages.
- [ ] Shared shell with traveler, partner and admin navigation; skip link and `id="main-content"` on each.
- [ ] Role navigation and guest redirect checks; BFF auth e2e still green.

## 5. Traveler

- [ ] Dashboard and trips (list, new, detail).
- [ ] Planner and road mode (map-first).
- [ ] Memory and invitations.
- [ ] Profile (settings, billing, collections), payment, travel book, partner registration.
- [ ] Journey e2e updated; visual review with mock data.

## 6. Partner and admin

- [ ] Partner: overview, listings, analytics, campaigns, reviews, billing.
- [ ] Admin: dashboard, moderation, partners, affiliates, finance, settings.
- [ ] Tables, filters, empty/error states; charts only for real data.

## 7. Public

- [ ] Explore, public trip, community feed, public profile.
- [ ] Viewport matrix across nine widths for every no-login route.

## 8. Hardening

- [ ] Accessibility and responsive audit; reduced motion.
- [ ] Dependency review and dead-code sweep.
- [ ] `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, full Playwright, `git diff --check`.
- [ ] Before/after screenshots and residual-risk list in the handoff.
