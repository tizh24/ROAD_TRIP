# Claude session handoff: what changed and how to test it

Date: 2026-10-27. Branch: `dev` (commits not pushed).
Commits covered: `87e57d9` to `26126e4` (12 commits).

Convention: every command is PowerShell, run from the folder shown. Ports: web dev `3000` (or `3100` for e2e), Gateway as set in `NEXT_PUBLIC_API_URL`.

---

## 0. Run the stack

```powershell
# one time
cd D:\ROAD_TRIP\server ; pnpm install
cd D:\ROAD_TRIP\web    ; npm install

# backend, hosted Supabase (needs server\.env.hosted.local, never commit it)
cd D:\ROAD_TRIP\server ; pnpm dev:hosted
#   or local Docker
cd D:\ROAD_TRIP\server ; pnpm platform:up      # stop: pnpm platform:down

# web
cd D:\ROAD_TRIP\web    ; npm run dev           # http://localhost:3000
```

Without a backend the web still renders; data pages show "Không thể kết nối tới dịch vụ. Vui lòng thử lại." with a retry button. That is expected, not a bug.

Automated suites:

```powershell
# web: static checks and unit tests
cd D:\ROAD_TRIP\web
npm run typecheck ; npm run lint ; npm test ; npm run build

# web: Playwright (terminal 1 keeps the server, terminal 2 runs tests)
npx next dev -p 3100
curl.exe http://localhost:3100/reset-password     # warm the cold compile, avoids a false failure
$env:E2E_BASE_URL = "http://localhost:3100"
npx playwright test

# server
cd D:\ROAD_TRIP\server
pnpm typecheck ; pnpm lint ; pnpm test            # use pnpm test, not raw jest (needs --experimental-vm-modules)
```

Last known results: web typecheck/lint/`npm test` clean, build clean (before the final commit), Playwright 35 passed and 2 skipped.

---

## 1. Summary of work, by area

### 1.1 Server and database (commits `87e57d9`, `863d0fc`, `26e8f2f`, `0684459`)

| Change | Where |
| --- | --- |
| Migration chain repaired: `users_schema` created and granted | `supabase/migrations/20261018040000_add_slice_4_community_and_social.sql` |
| Community/partner repositories use `public.user_profiles`; partner approval writes `public.platform_audit_logs` | `core-trip-service/.../community.repository.ts`, `partner.repository.ts` |
| Trip status audit stores the previous status | `trip.repository.ts` |
| Gateway audit write no longer swallowed; failed audit reverts the role/status change | `api-gateway/src/auth/platform-profile.store.ts` |
| Password-reset redirect uses `PUBLIC_WEB_ORIGIN` + `/auth/recovery` | `auth-bff.controller.ts` |
| Gateway config validation (cookie names, `__Secure-`/`__Host-` need secure cookies, `PUBLIC_WEB_ORIGIN` must be in CORS list) | `packages/config/src/index.ts` |
| OpenAPI document now has response schemas, `Idempotency-Key`/`If-Match` only where required, all error codes | `api-gateway/src/openapi.ts`, `packages/contracts/src/http/errors.ts` |
| Notification worker retries failed deliveries through BullMQ; the delivery row is the idempotency record | `notification-worker/.../notification-event-handler.ts` |
| ADR-0005 records Community/Partner/Billing living in `core-trip-service` until 2027-01-31 | `docs/architecture/adr/0005-...md` |
| Hosted migrations `20261018010000` to `20261018060000` pushed by Codex; types regenerated | `packages/db-client/src/database.types.ts` |

How to test (server):

```powershell
cd D:\ROAD_TRIP\server
pnpm test                                   # gateway session-cookie, csrf guard, openapi route coverage, config, worker retry tests
pnpm typecheck ; pnpm lint
pnpm platform:config                        # compose file is valid
```

Worker retry behaviour is covered by the in-memory fake DB spec in `notification-worker` (4 tests): success marks `SENT`, failure marks `FAILED` and rethrows, a `SENT` row is skipped, a revoked invitation is `SKIPPED`.

Not verified: API E2E on a live stack and hosted staging (platform-api-contract task 11) need credentials and are still open.

### 1.2 Web: auth via Gateway (commit `dbf08fd`)

- Supabase client removed from the browser (`src/lib/supabase/*` deleted, `@supabase/ssr` dropped).
- `/auth/callback` only redirects to `/login?authError=callback`.
- New `/auth/recovery` page imports tokens from the URL hash through `POST /api/v1/auth/session/import`, clears the hash, then goes to `/reset-password`.

### 1.3 Web: new public home page (commit `08c5624`)

- `/` is a new editorial landing in `src/app/(home)` with its own header and footer; content in `src/features/community/components/landing/`.
- Removed the old landing, its CSS and the copyrighted reference screenshot.
- Removed fake partner header/sidebar data and the hard-coded bank account/QR on `/payment`.
- Admin 403: `authInterrupts` enabled in `next.config.ts` so `forbidden()` works.
- Fonts via `next/font/google`.

### 1.4 Web: shadcn/ui adoption (commits `5b3bb99`, `a9c7c68`)

- Primitives in `src/components/ui/`: Button, Input, Label, Textarea, Badge, Skeleton, Dialog, AlertDialog, Sheet, Select, Tabs, Sonner (toast).
- `CTAButton` and `ConfirmDialog` are adapters over shadcn (same props). `BottomSheet` rebuilt on Sheet.
- All 26 `alert()`/`confirm()` calls replaced: errors are toasts; deletes and "complete trip" use a confirm dialog.
- Spec and plan amended to allow the primitive layer.

### 1.5 Web: contrast and tokens (commits `2901c76`, `f5838db`)

- Solid orange with white text now uses `--color-primary-strong` (`#B84E1B`, about 5.1:1). `#E87535` is only about 3:1.
- Legacy `brand-*` tokens alias the canonical palette.

### 1.6 Web: public/auth hardening (commit `26126e4`)

- `.field` moved into `@layer components` so padding utilities apply (search icon no longer overlaps placeholder).
- One `<main>` per page (21 nested ones removed); login has one `h1`.
- Gateway client error messages are Vietnamese.
- New 9-width viewport matrix e2e.

### 1.7 Checklists updated

| Checklist | State |
| --- | --- |
| `platform-api-contract/tasks.md` | tasks 1 to 10 done; 11 open (live stack, staging, metrics) |
| `jadoo-landing-replacement/tasks.md` | open: 5.5 only (needs manual pass with real accounts); `handoff.md` in that folder records verification |
| `tripz-cross-surface-editorial-ui-tasks.md` | group 1 done (4 tasks); groups 2 to 4 open |

---

## 2. How to test each web route

Start the web first (`npm run dev`). "Backend" means the Gateway is running and `NEXT_PUBLIC_API_URL` points at it. A guest is someone not logged in.

### 2.1 Public routes (no login)

| Route | What to check | Needs backend |
| --- | --- | --- |
| `/` | Hero, four value items, four destinations, plan steps, newsletter. Header "Đăng nhập" goes to `/login`. "Bắt đầu lên kế hoạch" as guest goes to `/login?next=/trips/new`. Newsletter: invalid email shows "Nhập một địa chỉ email hợp lệ"; a valid one says nothing was stored. Mobile (under 1024px): menu button opens, Escape closes and returns focus. No horizontal scroll at 320px. No metrics or testimonials anywhere. | Optional: with backend, the plan-steps panel shows a real public trip; without it shows "Chưa có lộ trình công khai". |
| `/explore` | Title, search box (icon must not overlap the placeholder), budget chips filter the list, "Đặt lại bộ lọc" appears when filtering. Without backend: error text plus "Thử lại". Count "(n)" is hidden while loading. | Yes for data |
| `/trip/{id}` | Public trip detail; the clone button is orange with white text. | Yes |
| `/feed`, `/community/feed` | Community feed; like, save, comment and report as a guest show a toast asking to log in (not a browser alert). | Yes |
| `/profile/{username}` | Public profile; follow as guest shows a login toast. | Yes |
| `/health` | Returns a health response. | No |

### 2.2 Auth routes (no login)

| Route | What to check |
| --- | --- |
| `/login` | One `h1` "Chào mừng trở lại". Labels "Email" and "Mật khẩu". Link "Quên mật khẩu?" and "Tạo tài khoản" are readable orange-brown. On desktop the dark left panel is visible; on mobile only the form. Wrong credentials show an error. |
| `/signup`, `/forgot-password`, `/reset-password` | Same card layout; inputs have padding and focus ring. |
| `/auth/recovery` | Opened from the reset email link (tokens in the URL hash). Without tokens it shows an alert and a link to `/forgot-password`. With tokens it calls the Gateway, clears the hash and moves to `/reset-password`. Fake test: `http://localhost:3000/auth/recovery#access_token=a&refresh_token=b&expires_in=3600&type=recovery` (will fail at the Gateway with real validation, which should show the recoverable error, not a blank page). |
| `/auth/callback` | Legacy OAuth path; must redirect to `/login?authError=callback` without contacting Supabase. |

### 2.3 Traveler routes (login as a traveler)

Guest behaviour for all of these: redirected to `/login?next=<original path>`.

| Route | What to check |
| --- | --- |
| `/dashboard`, `/trips`, `/trips/new`, `/trips/{id}` | Create a trip, list shows it. Primary buttons are `#B84E1B`. |
| `/planner`, `/planner/new`, `/planner/{id}` | Planner and itinerary editing. |
| `/road/{id}` | Road mode. "Hoàn tất chuyến đi" opens a confirm dialog (Escape or "Hủy" closes it, "Hoàn tất" completes). GPS share errors appear as toasts. |
| `/memory/{id}` | Add a photo, add an expense, delete an expense: delete opens a confirm dialog ("Xóa khoản chi tiêu?"). Errors are toasts. |
| `/trip-invitations/{token}` | Invitation landing. |
| `/profile`, `/profile/settings`, `/profile/billing`, `/profile/collections` | Profile pages render with one `main`. |
| `/travel-book/{id}`, `/payment` | Order form: missing fields show a toast. `/payment` has no fake bank/QR, only an honest note. |
| `/partner/register` | Partner application; submit errors are toasts. |

### 2.4 Partner routes (login as an approved partner)

`/partner`, `/partner/dashboard`, `/partner/listings`, `/partner/analytics`, `/partner/campaigns`, `/partner/reviews`, `/partner/billing`.

- Header shows only the page title and sign-out (the fake search/profile data was removed).
- Deleting a listing opens a confirm dialog ("Xóa dịch vụ?").
- A traveler account must be rejected from these routes.

### 2.5 Admin routes (login as an admin)

`/admin`, `/admin/dashboard`, `/admin/moderation`, `/admin/partners`, `/admin/affiliates`, `/admin/finance`, `/admin/settings`.

- A non-admin gets the 403 page (works because `authInterrupts` is on), not a crash.
- Partner approval and role changes produce an audit row in `public.platform_audit_logs`; errors are toasts.

### 2.6 Dialogs, toasts and sheet (anywhere they appear)

- Dialog: focus moves inside, Tab stays inside, Escape closes, focus returns to the trigger.
- Toast: appears top-centre, auto-dismisses.
- `BottomSheet` has no caller yet; test it by temporarily rendering `<BottomSheet isOpen onClose={...}>` on any page: three width presets (Thu gọn / Tiêu chuẩn / Mở rộng), Escape closes.

---

## 3. Automated route coverage (Playwright)

| Spec | Covers |
| --- | --- |
| `public-landing.spec.ts` | `/` at 320/768/1440, CTAs, mobile menu keyboard, newsletter, no invented claims |
| `viewport-matrix.spec.ts` | `/`, `/explore`, `/login`, `/signup`, `/forgot-password` at 9 widths (no overflow, one `main`, one `h1`); 44px mobile buttons |
| `accessibility-responsive.spec.ts` | Login labelled and not overflowing at 375/768/1440 |
| `navigation-responsive.spec.ts` | Home navigation responsive behaviour |
| `guest-routes.spec.ts` | Protected routes redirect a guest to login and keep the return path |
| `bff-auth.spec.ts` | Recovery import through the Gateway only, error states, legacy callback |
| `slice-1-discovery-clone.spec.ts`, `journeys-a-b.spec.ts`, `journey-c.spec.ts` | Discovery/clone and trip journeys (some tests skip without a live backend) |

Run one spec:

```powershell
$env:E2E_BASE_URL = "http://localhost:3100"
npx playwright test public-landing
```

Known caveat: the first run after starting `next dev` can fail `bff-auth` because `/reset-password` compiles slowly; warm it with `curl.exe` and rerun.

## 4. Not covered automatically (do these by hand)

- Authenticated traveler, partner and admin screens (needs real accounts): Jadoo task 5.5 and cross-surface groups 2 and 3.
- Login and signup are server actions, so Playwright cannot mock them.
- Reduced-motion with a real OS setting.
- Destination photos on `/` are stock placeholders; the Hội An one shows food.
- Admin and partner layouts have `<main>` without `id="main-content"` or a skip link (cross-surface task 3).
- Remaining `text-primary` text on light backgrounds elsewhere is about 3:1 (fine only for large bold text).

## 5. Still open (needs you or Codex)

Hosted credentials and staging verification, Railway/Vercel deploy, platform-api-contract task 11, hosted-native-development (2), backend-api-web-integration (11), product-flow decisions, Stitch checklist (to be marked superseded once you confirm).
