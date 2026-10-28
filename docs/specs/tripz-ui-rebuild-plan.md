# Tripz UI Rebuild — Implementation Plan

Spec: `./tripz-ui-rebuild-spec.md`. Branch: `ui/redesign`.

## Boundaries

- Work stays in `web/` presentation code, layouts, route wrappers, visual tests, and design docs.
- Keep API clients, server actions, types, route protection and backend services untouched.
- Read `web/node_modules/next/dist/docs/` before writing Next code (`web/AGENTS.md`).
- Reference repos are cloned into the session scratchpad only (untrusted data). Nothing is executed from them; files are read and selectively adapted.

## Tooling

- taste-skill installed as a project skill (`.claude/skills/taste-skill`), with working files in `.taste-skill/` (ignored by git except accepted direction sheets).
- Needs Node 22+ (present: 22.15) and Edge/Chrome (Edge present) for `inspect.mjs` and screenshots.
- `assets.mjs` needs network; it fetches open-archive photographs with credits. Chosen photos are stored under `web/public/` with a `CREDITS.md`.

## Phases

### Phase 0 — Spec, plan, tasks

Write the three documents, mark `tripz-cross-surface-editorial-ui-*`, `web-experience-redesign/*` and `stitch-tripz-ui-adoption-*` as superseded. **Gate: owner approves the spec.**

### Phase 1 — Direction

1. Inventory the subject: 8 to 12 things that belong only to Tripz (Vietnamese roads and passes, motorbike/car/camper, emergency numbers 113/115/116, day-by-day route, shared planning, trip memory).
2. Write the argument (claims and proof per landing section; drop any section without a claim).
3. `draw.mjs` for the page (sector, brief, sections), three directions; same for the app (`--app`, `--kind` dashboard/admin) keeping the page's palette and type.
4. Produce a one-screen mock of each direction for the owner. **Gate: owner chooses a direction.**
5. Record the chosen direction sheet as `docs/design/direction.md` and replace `DESIGN.md`.

### Phase 2 — Foundation

- Tokens, fonts and base CSS rewritten from the chosen direction (`globals.css`, `layout.tsx`); retire `brand-*`, legacy aliases and the old palette.
- Adapt shadcn Radix primitives to the new tokens; add missing primitives needed by the dashboard (Sidebar, Card, Table, Breadcrumb, Dropdown Menu, Tooltip, Avatar, Calendar/Popover, Chart wrapper, Form helpers).
- Port the dashboard shell from the template: `SidebarProvider`, `AppSidebar`, header, content frame, route error boundary, loading state. Replace Base UI imports with Radix equivalents.
- Replace `Navbar`, `PageHeader`, `TripCard`, `StatBadge`, `AvatarCluster`, `ExpenseChip`, `MapMarker`, `FeedbackState`, `CTAButton` with new-system components (delete adapters and dead code).
- Gate: typecheck, lint, build.

### Phase 2b — Overlays and shared states (before any route)

- Restyle Dialog, AlertDialog, Sheet, Dropdown Menu, Select, Popover, Tooltip, Calendar, Toast and the mobile navigation drawer in the new system; one motion and focus behavior for all.
- Rebuild `ConfirmDialog`, `BottomSheet`, `FeedbackState`, empty/error/loading blocks and the 401/403/404/error pages.
- Replace hand-written modals (`AdminPartnersPanel`, `CommunityFeedView`, `PartnerOverviewPanel`) with the shared Dialog/Sheet.
- Add an internal `/_design` page is **not** created in production; overlays are reviewed via a temporary local route that is deleted before the phase commit.

### Phase 3 — Landing `/`

- Rebuild with the page run: sections from the argument, taste-skill composition, real photographs with credits, interface fragments built from real app components.
- Structure follows the reference rhythm (header, hero with search/CTA, destination cards, experiences, how it works, newsletter, closing CTA, footer) with Tripz content only.
- Gate: `inspect.mjs`, screenshots at 320/768/1440, `public-landing` and `viewport-matrix` e2e updated and passing.

### Phase 4 — Shell and auth

- Login on the owner's Beam stage-and-card layout; signup, forgot, reset and recovery share it. Template auth layouts are only a fallback for pieces the Beam layout does not cover. Existing `login` server action is reused as is.
- One shell, three navigation sets: traveler, partner, admin. Skip link and `id="main-content"` on all shells (closes the admin/partner gap).
- Gate: BFF auth e2e, guest redirects, role navigation checks.

### Phase 5 — Traveler

Dashboard, trips list/new/detail, planner, road mode, memory, invitations, profile (settings, billing, collections), payment, travel book, partner registration. Planner and road mode stay map-first. Dialogs and toasts use the shared Radix/Sonner components.

### Phase 6 — Partner and Admin

Partner (5 views plus register flow) and admin (6 views): tables with rules and aligned numbers, filters, charts only for real data, honest empty states.

### Phase 7 — Public

Explore, public trip, community feed, public profile. Viewport matrix across the nine widths.

### Phase 8 — Hardening

- Run the legacy grep gate from the spec (old tokens and hex values, native `confirm`/`alert`, hand-rolled overlays); it must return nothing.
- Overlay checklist for every overlay type: focus trap, Escape, focus return, scroll lock, mobile width, reduced motion.
- Accessibility and responsive audit, dead-code sweep, dependency review, `git diff --check`.
- Before/after screenshots, residual-risk list, updated `docs/handoff-claude-session-*.md`.

## Testing strategy

- Each phase ends with typecheck, lint, `npm test`, build and the affected Playwright specs (use `E2E_BASE_URL=http://localhost:3100`; warm routes first).
- Extend `viewport-matrix.spec.ts` to every route group that renders without login; add shell and role-navigation checks.
- Authenticated screens: local mock data for visual review, then a manual pass with real accounts (owner) — recorded as residual risk until done.

## Rollout

- One commit per phase (or per route group inside a phase) on `ui/redesign`; no push until the owner asks.
- Phase gates that need the owner: spec approval (Phase 0) and direction choice (Phase 1).
