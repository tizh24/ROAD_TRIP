# Tripz web UI rebuild: handoff

Branch `ui/redesign` (from `dev`), not pushed. Spec, plan and tasks are in `docs/specs/tripz-ui-rebuild-*.md`. The design contract is `DESIGN.md`; the directions chosen are in `docs/design/direction.md`.

## What changed

- New neutral system: Inter, oklch neutrals, flat surfaces, one dark primary, status colours only for status (`--color-success`, `--color-warning`, `--color-info`, `--destructive`).
- Landing on `product-performs`; dashboards, tables and workspaces on `achromatic-ledger`.
- One shell (`AppShell`) for traveler, partner and admin; one shared `Navbar` (mobile menu on `Sheet`) for public pages; `WorkspacePage` for partner and admin pages.
- Every overlay uses the shared Radix primitives (`Dialog`, `AlertDialog`, `Sheet`, `DropdownMenu`, `Tooltip`).
- Seven unused shared components with legacy styles were deleted (`AvatarCluster`, `ExpenseChip`, `MapMarker`, `PageHeader`, `StatBadge`, `TripCard`, `BottomSheet`). The unused `cn` npm package was removed.
- Titles: `%s · Tripz` template, per-page titles, SVG icon (`src/app/icon.svg`). Boilerplate favicon and SVGs removed.

## Verified

`tsc`, `eslint .`, `npm test` (all `# fail 0`), `npm run build`, `git diff --check` clean. Playwright on a production build: 37 passed, 2 skipped. taste-skill `inspect.mjs --app`: Explore 0 FAIL; login, signup and forgot-password 1 FAIL each, the owner-approved Beam gradient.

## Residual risks

1. **Authenticated screens are not reviewed by eye.** Dashboard, planner, road mode, memory, payment, Travel Book, partner and admin need a login. They pass types, lint and the existing journey e2e, but nobody has looked at them rendered with real data. Do a manual pass with a real account before release.
2. **Landing sample data.** The demo trip (leg distances, average speeds, 3.000.000 đ budget, 1.250.000 đ spent) is illustrative and labelled as such. Confirm or replace.
3. **Landing photographs** come from Wikimedia Commons (CC BY-SA and CC0), credited in the footer and `web/src/assets/landing/CREDITS.md`. Keep the credits if the pictures stay.
4. **OAuth buttons** (Google, Facebook, Apple) are present but not wired. Replace the body of `startOAuth()` in `web/src/features/auth/oauth-providers.ts`.
5. **Newsletter** block was dropped (no backend).
6. **Muted text** (`--muted-foreground`) and `--destructive` were darkened to reach AA contrast; grey text is slightly darker site wide.
7. **Not covered by UI work:** native mobile app (`mobile/`), email or print views (none exist in `web/`), hosted staging checks, credentials.
8. **Partner and admin panels** show honest empty states; no charts were drawn because there is no real data source yet.
9. **Cold routes** in the first Playwright run can time out once (seen once on `/auth/recovery`); warm routes with curl first.
10. **Line endings:** the working copy uses CRLF; git warns on commit but stores no whitespace errors.

## Not done on purpose

- No dark theme (light only, per the brief).
- No before/after screenshot pairs: the old design was deleted before work began. After screenshots of the public routes are under `web/.taste-skill/` (git-ignored).
