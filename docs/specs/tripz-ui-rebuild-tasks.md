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
- [x] Rewrite tokens, fonts and base CSS from the chosen direction.
- [x] Adapt existing Radix primitives to the new tokens.
- [x] Add Sidebar, Card, Table, Breadcrumb, Dropdown Menu, Tooltip, Avatar, Popover/Calendar and Chart primitives (Radix).
- [x] Port dashboard shell (sidebar, header, content frame, error boundary, loading) with Radix.
- [x] Legacy token names, aliases and helper classes removed and every usage migrated to the new tokens (shared components `TripCard`, `Navbar`, `CTAButton`... still to be rebuilt in 2b/3). Known page-level leftovers to remove when their page is rebuilt: raw hex colors in payment, travel-book, moderation, overview, partner overview and newsletter views; `surface-card` and `.field` helpers.
- [x] Gate: typecheck, lint, build.

## 2b. Overlays and shared states

- [ ] Restyle Dialog, AlertDialog, Sheet, Dropdown Menu, Select, Popover, Tooltip, Calendar and Toast.
- [x] Rebuild `ConfirmDialog`, `BottomSheet` and the app-shell mobile drawer (traveler, partner, admin). The landing menu is rebuilt in Phase 3.
- [x] Rebuild `FeedbackState` (flat, dashed frame, no tinted icon tile). Route-level loading skeletons are reviewed per route group.
- [x] Rebuild 401, 403, 404 and add the missing `error.tsx` and `global-error.tsx` (shared `StatusPage`).
- [x] Replace hand-written modals in `AdminPartnersPanel`, `CommunityFeedView` and `PartnerOverviewPanel` with shared Dialog (4 modals). Their inner form fields are restyled with each page in Phases 5 to 7.
- [ ] Rebuild form field, validation message, disabled and busy states.
- [ ] Review all overlays in a temporary local route (deleted before commit): focus trap, Escape, focus return, scroll lock, mobile width. Done for Dialog, AlertDialog (`ConfirmDialog`) and Sheet (`BottomSheet`) at 1280 and 390 px (36 automated checks pass); Dropdown Menu, Select, Popover, Tooltip, Calendar and Toast still to review.

## 3. Landing

- [x] Gather real photographs with credits (`assets.mjs`); stored in `web/src/assets/landing/` with `CREDITS.md`. Four found photographs (Wikimedia Commons); no AI images were needed.
- [x] Build sections from the argument: top bar, hero, live planner demo, destinations crossfade, pinned features, call-and-response, public-trip agenda, closing sentence, footer with credits. The newsletter is dropped because no newsletter backend exists.
- [x] Run `inspect.mjs`: 0 FAIL at 1440, 768 and 390. Three WARNs kept on purpose: hero void (dealt hero leaves the right half blank), below-fold (app-screen heuristic), panel void in the demo card. Screenshots reviewed at three widths; one more look round after fixes is still advisable.
- [x] Update `public-landing` and `navigation-responsive` e2e (live demo, pinned sheet and closing search covered).

## 4. Shell and auth

- [x] Login on the owner's Beam stage-and-card layout (see spec): existing server action kept, Vietnamese copy, Google/Facebook/Apple buttons (not wired yet), original framer-motion wash, new palette.
- [x] Signup, forgot-password, reset-password and recovery use the same layout (shared `AuthStage` component in `web/src/features/auth/components/`).
- [x] Shared shell with traveler, partner and admin navigation; skip link and `id="main-content"` on each.
- [ ] Role navigation and guest redirect checks; BFF auth e2e still green.

## 5. Traveler

- [x] Dashboard and trips (list, new). Public trip detail (`TripDetailView`) moves to Phase 7.
- [x] Planner (editor, place search, collaboration) and road mode (map-first).
- [x] Memory and invitations.
- [x] Profile (settings, billing), payment, travel book, partner registration.
- [x] Journey e2e green on a production build (37 passed, 2 skipped).
- [ ] Visual review with mock data (authenticated screens cannot be opened without an account).

## 6. Partner and admin

- [ ] Partner: overview, listings, analytics, campaigns, reviews, billing.
- [ ] Admin: dashboard, moderation, partners, affiliates, finance, settings.
- [ ] Tables, filters, empty/error states; charts only for real data.

## 7. Public

- [x] Explore, public trip, community feed, public profile; shared Navbar on `Sheet` for mobile.
- [ ] Viewport matrix across nine widths for every no-login route.

## 8. Hardening

- [ ] Legacy grep gate returns nothing (old tokens/hex values, native `confirm`/`alert`, hand-rolled overlays).
- [ ] Overlay checklist passed for every overlay type.
- [ ] Favicon and metadata titles match the new brand; list any email/print views and their disposition.
- [ ] Accessibility and responsive audit; reduced motion.
- [ ] Dependency review and dead-code sweep.
- [ ] `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, full Playwright, `git diff --check`.
- [ ] Before/after screenshots and residual-risk list in the handoff.
