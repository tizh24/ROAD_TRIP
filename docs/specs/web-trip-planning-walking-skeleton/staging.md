# T063 staging deployment and acceptance

Status: **accepted for the budget demo staging target**. Evidence recorded on 2026-10-03
(Asia/Saigon). The current environment is a budget demo, not a production release.

## Deployment

- Web: https://tripz-vn.vercel.app, Vercel project `web`.
- Backend: Docker Compose on the operator's Windows machine, published through
  a Cloudflare Quick Tunnel. Read the current URL from `server/.tunnel-url`.
- Auth and database: the same Supabase Cloud project. Do not combine Cloud Auth
  with the local Supabase database: user/profile foreign keys require matching users.
- Redis, Gateway, Core Trip, Geo and Notification Worker are running. Supabase
  local was stopped after switching the backend to Cloud PostgreSQL.
- Vercel stores frontend configuration. Backend staging credentials are injected
  from Infisical using a Windows machine identity. They are not written to an
  env file by the staging launcher.

## Repeatable release procedure

1. Select the release commit and confirm CI quality, clean-migration and E2E gates.
2. Obtain backend credentials from Infisical. The project ID is a non-secret
   launcher setting; Universal Auth credentials are stored only in the Windows
   user environment. Never commit them or print resolved Compose configuration.
3. Check the target Supabase project and migration history against
   `server/supabase/migrations`. From `server`, use `pnpm exec supabase migration
   list --linked` and `pnpm exec supabase db push --linked --dry-run`. Review any
   pending SQL and follow the backup/recovery procedure before applying it with
   `pnpm exec supabase db push --linked`. Never reset staging or replay an applied
   migration. The initial hosted history contains all nine repository versions,
   ending in `20260818010000`; no new SQL was needed during this demo deployment.
4. From `server`, deploy the active backend with Infisical injection:

   ```powershell
   pnpm platform:up:staging
   ```

5. Confirm Gateway readiness locally and through the running Quick Tunnel.
   Set `CORS_ALLOWED_ORIGINS` to the exact Vercel origin. Supply
   `LOCATIONIQ_API_KEY` through Infisical before live provider acceptance. The
   Geo service reads it only server-side; never place it in Vercel.
6. Set Vercel Production `NEXT_PUBLIC_API_URL` to the current Tunnel URL plus
   `/api/v1`. Both Supabase public variables must point to the same Cloud project
   as backend Auth. Rebuild/redeploy after changing public variables.
7. Run the checks below. Promote only when all T063 gates have evidence.

## Verification

From `web`, with the public URLs supplied as environment variables:

```powershell
$env:E2E_BASE_URL = 'https://tripz-vn.vercel.app'
$env:NEXT_PUBLIC_API_URL = (Get-Content ../server/.tunnel-url -Raw).Trim() + '/api/v1'
npm run test:staging:public
$env:E2E_BROWSER_CHANNEL = 'msedge'
npx playwright test e2e/guest-routes.spec.ts e2e/accessibility-responsive.spec.ts --workers=1
```

This is read-only public smoke. It checks web routes, login redirect, readiness,
unauthenticated API rejection, response correlation ID, and CORS allowlist.
Eight guest/responsive browser tests passed against this deployment. On 2026-10-03,
the authenticated Cloud owner/member fixture also passed Journey A/B/C on the same
Vercel deployment: all 10 Playwright tests passed with one worker. The fixture and
storage-state files are ignored local test data and are never committed.

Authenticated Journey A/B/C use dedicated Cloud owner/member fixtures with
storage state for this Vercel origin. Do not reuse local Supabase sessions or run
`prepare-local-e2e.mjs` against Cloud: that script deliberately only accepts
loopback URLs. Supply `E2E_OWNER_STORAGE_STATE`,
`E2E_MEMBER_STORAGE_STATE`, `E2E_TRIP_ID`, and `E2E_MEMBER_EMAIL`, then run the two
journey specs. Existing A/B tests mock Geo success; live provider verification
is recorded below.

Observed internal `/metrics` endpoints returned HTTP 200 for Core Trip and Geo,
with outbox and provider/cache metric families present. A public unauthenticated
request with `X-Correlation-ID: t063-staging-20261003` returned the same ID in
both response header and JSON metadata. Counters were zero. This proves endpoint
availability, **not** request-to-outbox-to-worker correlation or delivery.

On 2026-10-03, an authenticated trip creation with a fresh correlation ID
returned HTTP 201 from Gateway. The same ID and event ID appeared in the Gateway,
Core outbox, and Notification Worker logs. Those entries contain only method,
path, status, correlation ID, event ID, and event type; they omit tokens, emails,
and event payloads. Docker's full workspace build passed for the three services.

Infisical Universal Auth was verified with the staging machine identity. Compose
received 15 secrets from the `staging` environment, then rebuilt and started all
containers successfully; Gateway, Core, Geo, Worker, and Web readiness endpoints
returned HTTP 200.

On 2026-10-03, `LOCATIONIQ_API_KEY` was injected only into the Geo service from
Infisical. A read-only authenticated request through Gateway returned 200 with
three Dragon Bridge, Da Nang search results. Route preview returned 201 with
4,685 meters, 452 seconds and 125 GeoJSON coordinates. The same requests through
the active Quick Tunnel returned the same statuses and correlation ID, while CORS
returned exactly `https://tripz-vn.vercel.app`. The Vercel production alias was
then redeployed with the current tunnel URL; `/health`, `/`, and the repository
public smoke all returned successfully.

## Acceptance result

T063 is complete for the budget demo staging target. Quick Tunnel is ephemeral:
keep the local `cloudflared` process and Docker running; if it recreates the URL,
update Vercel `NEXT_PUBLIC_API_URL` and redeploy before the next public smoke.

The machine and Docker must stay running. Quick Tunnel URLs can change when the
tunnel is recreated; update Vercel and redeploy if that happens. Release rollback
and database restore rehearsal are tracked separately in T064.
