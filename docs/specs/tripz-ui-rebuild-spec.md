# Tripz UI Rebuild — Specification

Status: Draft for approval. Branch: `ui/redesign`. Date: 2026-10-27.

## Objective

Replace the entire web visual layer. The previous design (`DESIGN.md` orange/off-white editorial system, the Jadoo-derived landing, Stitch adoption, the cross-surface editorial pass and the web-experience-redesign) is **retired and is not a starting point**. The new design is derived from:

| Source | Used for |
| --- | --- |
| `Leonxlnx/taste-skill` (MIT) | Art-direction process for the landing page and for app screens: direction draw, house rules, real-browser inspection, look-and-fix loop |
| `shadcndashboard/next-shadcn-dashboard` (MIT) | Dashboard shell (sidebar, header, content frame), data tables, charts, form layouts and authentication page layouts, adapted to Radix |
| `travel-app-rho-blush.vercel.app` | Landing **section structure and rhythm only**: header, hero with search, destination cards, experiences, newsletter, closing call to action, footer |

Third-party code is adapted, not pasted wholesale: only the pieces a route needs are brought in, and each keeps its MIT notice where a file is copied.

## Decisions (approved 2026-10-27)

1. **Component base: Radix.** The shadcn `radix-vega` primitives already in `web/src/components/ui/` are kept. Dashboard components are ported to Radix.
2. **Palette and type: chosen from the taste-skill draw.** `draw.mjs` presents three directions with mock screenshots; the owner picks one. `DESIGN.md` is replaced by the chosen direction.
3. **No invented content.** Fake statistics, testimonials, prices, ratings, traveler counts and stock claims from the reference landing are not reproduced. Only its layout is used. Sections appear only when backed by real content or real data.
4. **Light theme only.** No dark mode, no theme switcher. It can be added later as its own spec.

## Scope

All frontend route groups, presentation layer only:

- Home `/`.
- Public: explore, public trip, community feed, public profile.
- Authentication: login, signup, forgot/reset password, recovery.
- Traveler: dashboard, trips, planner, road mode, memory, invitations, profile (settings, billing, collections), payment, travel book, partner registration.
- Partner portal: overview, listings, analytics, campaigns, reviews, billing.
- Admin portal: dashboard, moderation, partners, affiliates, finance, settings.

## Total coverage: nothing keeps the old look

The rebuild is complete only when **every** visible surface follows the new system, not just route pages. The following are explicitly in scope and each must be restyled or rebuilt:

- **Every route** listed above, plus route-level states: `loading`, `error`, `not-found` (404), `unauthorized` (401), `forbidden` (403) and the global error page.
- **Overlays and pop-ups:** confirm dialogs, form dialogs, sheets and side panels (`BottomSheet`), mobile navigation drawers (traveler, partner, admin sidebars and the landing menu), dropdown menus, selects, popovers, tooltips, date pickers, toasts, the cookie/offline banners if present.
- **Hand-written modals** that bypass the shared components (found in `AdminPartnersPanel`, `CommunityFeedView`, `PartnerOverviewPanel`) are migrated to the shared Dialog/Sheet so no one-off overlay remains.
- **Shared components:** buttons, inputs, labels, textareas, selects, badges, tabs, cards, tables, avatars, skeletons, empty/error/feedback states, page headers, search bar, trip card, stat display, expense chip, map marker and map overlays, pagination, breadcrumbs.
- **Forms:** field affordances, validation messages, disabled and busy states.
- **Document-level pieces:** favicon and metadata titles stay consistent with the new brand; email or print views, if any exist, are listed and either restyled or recorded as out of scope with a reason.

No component may keep a legacy class, token or color from the retired system (`brand-*`, `bg-primary-strong` experiments, `.field`, `.skip-link` styling from the old palette and similar). A grep gate enforces this (see acceptance criteria).

## Login layout (owner-specified, 2026-10-27)

The login page is rebuilt on the owner's "Beam" layout: a full-screen stage with a slowly rotating multi-color wash and a fine grid behind a single centered card (title, short subtitle, form, link to sign-up and password reset). Adaptations required so it fits this product:

- **Behavior is unchanged:** the form keeps the existing `login` server action (`useActionState`, Gateway cookies, `next` return path, existing error messages). The sample's `react-hook-form`, `zod` resolver and `@/app/actions/auth` are not used.
- **No social buttons.** The Gateway has no Google/GitHub sign-in endpoint and the web removed direct OAuth, so those buttons would be non-functional controls. They are omitted until a provider flow is specified; the layout leaves room for them.
- **Vietnamese copy** replaces the English text; labels, `autocomplete`, `spellcheck`, error `role="alert"` and the "Quên mật khẩu?" link are kept.
- **Colors come from the chosen direction.** The wash uses the direction's palette tokens, not the sample's `--chart-*` values, and must keep card text at AA contrast.
- **Motion:** CSS keyframes (no new `framer-motion` dependency), disabled under `prefers-reduced-motion`, slower than the 5 s sample loop, `will-change`/blur limited so it stays cheap on low-end phones, and paused when the tab is hidden.
- **Light theme only** (no dark variant), 320 px to 1920 px without overflow, one `h1`, one `main`.
- The same stage-and-card layout is applied to signup, forgot-password and reset-password so the auth routes stay consistent.

## Must remain unchanged

- Routes and URLs, auth guards and role boundaries, API calls and payloads, server actions, Gateway cookie/CSRF behavior, data types and domain workflows.
- Vietnamese interface language.
- Honest states: loading, empty, error and permission states stay truthful; no decorative controls that do nothing.

## Experience requirements

1. **Landing (page rules).** Each section is justified by a claim with proof (argument list before design). Real photography with credit. The hero carries Tripz-specific subject matter, not a category default.
2. **App screens (dashboard rules).** Color goes on data, not chrome. KPIs are type, not tinted tiles. Flat surfaces separated by rules. Tables use rules and right-aligned numbers. Empty sections keep their frame. Charts only for real data, with no vanity numbers.
3. **Shell.** One dashboard shell pattern shared by traveler, partner and admin, with role-specific navigation. The planner and road mode keep a map-first, task-dense layout.
4. **Responsive.** Usable at 320, 375, 390, 430, 768, 1024, 1280, 1440 and 1920 px with no horizontal scroll; 44 px touch targets on mobile.
5. **Accessibility.** WCAG AA text contrast, visible focus, semantic landmarks (one `main`, one `h1` per page, skip link on every shell), meaningful alt text, reduced-motion support.
6. **Performance hygiene.** No new heavy dependency without need (tiptap, lodash, syntax highlighter and similar from the template are excluded unless a route requires them).

## Acceptance criteria

- No remnant of the retired system: no `brand-*` tokens, no old `DESIGN.md` palette, no Jadoo/Stitch/cross-surface styles, no unused legacy components. Grep gate: zero matches for `brand-`, the old hex values (`#E87535`, `#B84E1B`, `#C95C24`, `#FAF9F6`, `#1B1B1B`, `#FFF1E6`), `native confirm(`/`alert(`, and hand-rolled `fixed inset-0` overlays outside the shared Dialog/Sheet.
- Every overlay type in the coverage list is exercised at least once in a test or a documented manual check: focus trap, Escape, return of focus, scroll lock, mobile width, reduced motion.
- 401, 403, 404 and error pages are shown in the new system and reviewed in screenshots.
- The owner approved a direction before any route is rebuilt.
- Every route renders in the new system and passes its checks: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, and Playwright (guest, landing, viewport matrix, BFF auth, journeys that run without a live backend).
- `inspect.mjs` (taste-skill) passes for the landing, and `inspect.mjs --app` for representative dashboard screens, or each deviation is documented.
- Screenshots at three widths per route group are recorded in the handoff; a juror-style review lists no unresolved P0/P1 issue.
- Authenticated screens that could not be verified with real accounts are listed as residual risk.

## Non-goals

- Backend, database, API, authorization or business-rule changes.
- New product features, new analytics, or content written as fact that the product cannot support.
- Dark mode.
- Replacing Radix with Base UI.

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Large surface (about 45 routes) | Phased commits per route group; each phase independently reviewable and revertible |
| Authenticated views cannot be checked against a live backend | Local mock data for visual review; residual-risk list in the handoff |
| Template code carries heavy dependencies | Port only needed components; review `package.json` diff each phase |
| e2e tests depend on current Vietnamese copy and structure | Update tests together with each phase; keep behavior assertions |
| Reference landing content is fabricated | Layout only; Tripz content supplied from the product's real capabilities |
