# Automated Test Matrix

**Scope:** T060
**Runner:** `cd server && pnpm test:matrix`

The full runner is intentionally fail-closed: it refuses to start when the live
web URL, owner/member authenticated storage states, collaboration fixture trip,
member email, or isolated database marker is absent. This prevents skipped
Playwright suites from being reported as a successful full matrix.

| Layer                     | Command / evidence              | Required behavior                                                                                                                                 |
| ------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit and domain           | `server: pnpm test`             | Value objects, aggregates, ordering, invitations, authorization, provider adapters, cache, outbox, notification idempotency                       |
| Integration               | `server: pnpm test:integration` | PostgreSQL repositories, atomic writes, optimistic conflicts, cross-trip protection                                                               |
| Constraints and RLS       | Supabase CLI `test db --db-url` | pgTAP constraints, roles/grants, owner/editor/viewer/outsider matrix, invitations and outbox                                                      |
| Contracts and service E2E | `server: pnpm test:e2e`         | Gateway auth/security/upstream contracts and active service HTTP behavior                                                                         |
| Web contracts             | `web: npm test`                 | Route protection, Gateway runtime schemas, retry headers, invitation token exposure, analytics privacy/deduplication                              |
| Product E2E               | `web: npm run test:e2e`         | Journey A/B/C, duplicate create retry, provider outage preservation, optimistic-conflict local-state preservation, accessibility/responsive smoke |

Generated Hello World tests from bounded contexts outside the active walking
skeleton are excluded from `server: pnpm test`; they are not counted as product
coverage.

## Prerequisites

Run against a dedicated disposable Supabase test database with migrations
applied, the active backend/web stack healthy, and these variables available:

```text
TEST_DATABASE_URL
TEST_DATABASE_ISOLATED=1
E2E_BASE_URL
E2E_OWNER_STORAGE_STATE
E2E_MEMBER_STORAGE_STATE
E2E_TRIP_ID
E2E_MEMBER_EMAIL
```

Storage-state paths are resolved from `web/`. The owner fixture may create
trips; the member and seeded trip are reserved for Journey C. That seeded trip
must have the owner as its only active member and exactly two stops on its first
day, so the viewer/editor permission change and persisted reorder are testable.
The full runner passes `TEST_DATABASE_URL` to the Supabase CLI's `test db
--db-url` option, so pgTAP can run against an isolated hosted database without
Docker. The URL must be percent-encoded and must not be the application
`DATABASE_URL`; the runner requires `TEST_DATABASE_ISOLATED=1` as an explicit
test-environment marker. The standalone `pnpm test:database` command still
targets the local Supabase CLI stack.

When Playwright's bundled Chromium is unavailable on Windows, set
`E2E_BROWSER_CHANNEL=msedge` to use the installed Edge browser. The default
remains Playwright Chromium.

## Local verification (2026-09-24)

- Backend unit tests, typecheck, lint, and service HTTP E2E: passed.
- Core Trip authorization tests now also reject trip and member administration
  for editor, viewer, removed member, and outsider; backend unit tests passed.
- Web contract tests and TypeScript typecheck: passed; Playwright discovered all
  six browser tests.
- Web accessibility/responsive Playwright smoke: 4/4 passed against a Next.js
  development server using installed Edge and the configured hosted Supabase
  public client. No Docker or database mutation was involved.
- Guest-route Playwright smoke: 4/4 passed against the same web setup; protected
  trip and invitation URLs redirect to login with the return path preserved.
- The full matrix preflight correctly fails when its required environment
  variables are absent. On Windows the runner launches package-manager commands
  through the shell so `.cmd` shims can execute.
- Database integration, pgTAP/RLS, and live browser journeys still require a
  dedicated migrated test database, running backend/web services, and the
  authenticated fixtures above. T060 remains open until those suites pass.
