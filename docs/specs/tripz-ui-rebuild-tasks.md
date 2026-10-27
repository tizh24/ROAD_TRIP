# Tripz UI Rebuild — Tasks

Spec: `./tripz-ui-rebuild-spec.md`. Plan: `./tripz-ui-rebuild-plan.md`.

## 0. Spec and housekeeping

- [x] Write spec, plan and tasks.
- [ ] Owner approves the spec. **(gate)**
- [ ] Mark the cross-surface, web-experience-redesign and Stitch checklists as superseded.

## 1. Direction

- [x] Install taste-skill as a project skill and verify `draw.mjs`/`inspect.mjs` run (Node 22, Edge).
- [x] Inventory the subject (8 to 12 Tripz-specific items).
- [x] Write the landing argument (claim and proof per section).
- [x] Draw three page directions and three app directions.
- [x] Owner chose the recommended directions (2026-10-27); separate mocks skipped, the real landing and shell are built and reviewed in the browser instead.
- [x] Palette and type taken from the reference sources (owner decision 2026-10-27). Composition direction still to be dealt with `--keep palette,type`. **(gate for composition)**
- [x] Save the direction sheet in `docs/design/direction.md`; replace `DESIGN.md`.

## 2. Foundation

- [x] Read the installed Next.js docs relevant to layouts, fonts and `next/image`.
- [ ] Rewrite tokens, fonts and base CSS from the chosen direction.
- [ ] Adapt existing Radix primitives to the new tokens.
- [x] Add Sidebar, Card, Table, Breadcrumb, Dropdown Menu, Tooltip, Avatar, Popover/Calendar and Chart primitives (Radix).
- [x] Port dashboard shell (sidebar, header, content frame, error boundary, loading) with Radix.
- [ ] Replace legacy shared components and delete dead code and `brand-*` tokens.
- [ ] Gate: typecheck, lint, build.

## 2b. Overlays and shared states

- [ ] Restyle Dialog, AlertDialog, Sheet, Dropdown Menu, Select, Popover, Tooltip, Calendar and Toast.
- [ ] Rebuild `ConfirmDialog`, `BottomSheet` and the mobile navigation drawers (landing, traveler, partner, admin).
- [ ] Rebuild `FeedbackState` and empty, error and loading blocks; skeletons match the new system.
- [ ] Rebuild 401, 403, 404 and global error pages.
- [ ] Replace hand-written modals in `AdminPartnersPanel`, `CommunityFeedView` and `PartnerOverviewPanel` with shared Dialog/Sheet.
- [ ] Rebuild form field, validation message, disabled and busy states.
- [ ] Review all overlays in a temporary local route (deleted before commit): focus trap, Escape, focus return, scroll lock, mobile width.

## 3. Landing

- [ ] Gather real photographs with credits (`assets.mjs`); store with `CREDITS.md`.
- [ ] Build sections from the argument; header, hero, content sections, newsletter, closing call to action, footer.
- [ ] Run `inspect.mjs`; screenshots at 320/768/1440; fix and re-look.
- [ ] Update `public-landing` and `navigation-responsive` e2e.

## 4. Shell and auth

- [x] Login on the owner's Beam stage-and-card layout (see spec): existing server action kept, Vietnamese copy, Google/Facebook/Apple buttons (not wired yet), original framer-motion wash, new palette.
- [x] Signup, forgot-password, reset-password and recovery use the same layout (shared `AuthStage` component in `web/src/features/auth/components/`).
- [x] Shared shell with traveler, partner and admin navigation; skip link and `id="main-content"` on each.
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

- [ ] Legacy grep gate returns nothing (old tokens/hex values, native `confirm`/`alert`, hand-rolled overlays).
- [ ] Overlay checklist passed for every overlay type.
- [ ] Favicon and metadata titles match the new brand; list any email/print views and their disposition.
- [ ] Accessibility and responsive audit; reduced motion.
- [ ] Dependency review and dead-code sweep.
- [ ] `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, full Playwright, `git diff --check`.
- [ ] Before/after screenshots and residual-risk list in the handoff.
