# T065 final acceptance

**Status:** accepted for the budget demo staging target
**Evidence date:** 2026-10-04 (Asia/Saigon)

## Acceptance evidence

| Gate | Evidence | Result |
| --- | --- | --- |
| Journeys A, B, C and guest/responsive paths | Playwright against `https://tripz-vn.vercel.app`, one worker, authenticated Cloud owner/member storage states | 10/10 passed |
| Public deployment smoke | `npm run test:staging:public` against Vercel and the active Quick Tunnel | Passed: public routes, guest redirect, Gateway readiness, authentication guard, correlation ID and CORS allowlist |
| Web quality | `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` | Passed |
| Backend quality | `pnpm lint`, `pnpm typecheck`, `pnpm test` | Passed |
| Production dependency security | `npm audit --omit=dev --json` | 0 vulnerabilities |
| Runtime health | Compose Gateway, Core Trip, Geo, Notification Worker, Redis and Web | All healthy; Gateway readiness returned 200 through the tunnel |
| Mobile scope | `git diff --name-only 1c60fb4..HEAD -- mobile` | No output; mobile was unchanged |
| Recovery and rollback | Backup/restore probe, BullMQ replay, API Gateway rollback compatibility | Recorded in [recovery.md](recovery.md) |

## Security disposition

Next.js is pinned to 16.3.8, Playwright to 1.55.1 and the matching
`eslint-config-next` version is pinned. This removes the previously reported
runtime critical Next.js advisories and the Playwright/Sharp high advisories.

`npm audit` including development tooling still reports high advisories in the
Next ESLint dependency chain. The current Next 16-compatible ESLint package has
no non-breaking upstream remediation. These packages are development-only and
are excluded from the Vercel runtime bundle. Production audit is the release
gate and is clean.

## Known limitations and next backlog

1. The backend runs on the operator's Windows machine. The Cloudflare Quick
   Tunnel URL changes after its process or the machine restarts; update Vercel
   `NEXT_PUBLIC_API_URL` and redeploy before another demo.
2. The demo has no always-on backend. Move Docker Compose to persistent hosting
   and use a named Cloudflare Tunnel plus a domain before production release.
3. LocationIQ is a budget demo provider. Its quota, coverage and routing data
   must be monitored; motorcycle travel currently uses driving route data.
4. Staging uses the Cloud Supabase project and dedicated test fixtures. A
   production release needs a separately governed production project, backup
   retention policy and routine restore rehearsal.
5. The upstream `eslint-config-next` development dependency needs a future
   upgrade or replacement once Next provides a compatible remediation.

## Release conclusion

The web-first walking skeleton meets its specification acceptance criteria for
the budget demo staging target. It is ready for demonstrations while the items
above remain the production-release backlog.
