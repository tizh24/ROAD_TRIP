# Road Trip Platform API Contract — Implementation Plan

**Status:** Draft — phase 1 is ready to be tasked; future bounded contexts
require their own approved behavioral specifications.

## 1. Delivery boundary

Implement one end-to-end, deployable vertical slice first:

1. Gateway BFF session and account/profile APIs backed by Supabase Auth.
2. Server-side platform-role resolution from `public.user_profiles`.
3. Cookie-backed browser authentication for the web application.
4. Complete, runtime-aligned OpenAPI contracts for the existing trip/geo APIs.
5. Web migration from direct Supabase calls to Gateway APIs.

Check-ins, expenses, memories, community, partner, payments, media and
notifications remain deliberately out of the implementation boundary until
their individual specifications define lifecycle, privacy, money and moderation
rules. This prevents empty controllers from becoming an accidental product
contract.

## 2. Identity and authorization design

### 2.1 Session boundary

- Supabase Auth remains the only password/OAuth identity provider.
- Gateway calls Supabase Auth server-to-server via an adapter. Browser calls
  only `api.tripz.vn/api/v1` in production.
- On a successful login, refresh or confirmation callback, Gateway writes the
  access and refresh tokens to separate `HttpOnly`, `Secure`, `SameSite=Lax`
  cookies scoped to the shared parent domain (`tripz.vn`). Production cookie
  names use the `__Secure-` prefix; local HTTP development uses separate
  unprefixed names. All cookie options are configuration-backed.
- Gateway accepts an access token from the session cookie. Bearer token support
  is retained only for native/CLI clients, documented as a separate security
  scheme. A browser does not store tokens in local/session storage.
- Unsafe cookie-authenticated methods require an origin check against
  `CORS_ALLOWED_ORIGINS` and a CSRF double-submit/header token. OAuth uses
  Supabase-supported PKCE/state and an allowlisted internal return path.
- Logout clears both cookies and calls Supabase sign-out. Refresh rotates the
  server-held session and replaces cookies. No token is returned in a JSON body.

### 2.2 Platform role resolution

- Add `PlatformRole = USER | PARTNER | ADMIN` and `AccountStatus`
  (`ACTIVE | BANNED | DELETED`) to gateway
  context; never map Supabase JWT `role=authenticated` to it.
- Gateway's authorization adapter reads a profile by authenticated subject with
  a least-privileged server credential. It returns the stored role and account
  status; missing/inactive profiles are rejected before domain proxying.
- The gateway forwards identity plus resolved platform role to internal services
  in signed/credential-protected internal requests. Core Trip Service continues
  to be the owner of `OWNER | EDITOR | VIEWER` access decisions.
- Profile self-service permits only presentation/preferences fields. Admin role
  or account-status changes use a dedicated operation that records actor,
  subject, old/new values, correlation ID and timestamp in an immutable audit
  table.

### 2.3 Required configuration

Extend the gateway configuration with server-only Supabase credentials and the
canonical browser/API domain values. These values must never use `NEXT_PUBLIC_`
or be sent to a client:

- `SUPABASE_SERVICE_ROLE_KEY` (or an equivalently least-privileged credential)
- `AUTH_COOKIE_DOMAIN`, `AUTH_COOKIE_SECURE`, cookie names and max ages
- `PUBLIC_WEB_ORIGIN` / allowlisted OAuth return paths
- `CSRF_COOKIE_NAME`

The hosted-native example documents variable names only; `.env.hosted.local`
remains ignored.

## 3. Public v1 endpoints for phase 1

| Method | Path | Session | Authorization |
| --- | --- | --- | --- |
| POST | `/auth/register` | none | Guest; rate limited |
| POST | `/auth/login` | none | Guest; rate limited |
| POST | `/auth/refresh` | refresh cookie | Current session |
| POST | `/auth/logout` | access/refresh cookie | Current session |
| POST | `/auth/password/reset` | none | Guest; rate limited |
| POST | `/auth/password/change` | current session | Active User/Partner/Admin |
| GET | `/me` | current session or bearer | Active User/Partner/Admin |
| GET | `/profile` | current session or bearer | Self |
| PATCH | `/profile` | current session or bearer | Self; allowlisted fields only |
| PATCH | `/admin/users/{userId}/role` | current session or bearer | Admin; audited |
| PATCH | `/admin/users/{userId}/status` | current session or bearer | Admin; audited |

All return the shared `{ data, meta }` success envelope or `{ error, meta }`
error envelope. Login/register responses intentionally contain no credential
material. Register exposes only confirmation-required state and a generic
response for address-enumeration-resistant flows.

## 4. Existing trip and geo contract repair

1. Replace `emptyResponse` in `openapi.ts` with reusable schemas matching the
   Core Trip and Geo responses: trip list/detail, day, stop, member,
   invitation, place result, route preview and pagination metadata.
2. Add all runtime routes, especially `GET /trips/{tripId}/invitations`, with
   query/path/header parameters, examples, resource permission and errors.
3. Define idempotency only on commands actually backed by idempotency storage;
   otherwise remove the misleading claim and implement it in the owning service
   before advertising the header.
4. Declare cookie and bearer security alternatives accurately in OpenAPI; mark
   browser-only endpoints with CSRF requirements.
5. Add a contract test that enumerates proxy routes and fails when a public
   runtime route is absent from OpenAPI or uses an empty success schema.

## 5. Web migration

- Replace direct calls in `web/src/features/auth/actions.ts` and direct profile
  table access with a typed Gateway client that calls BFF endpoints using
  `credentials: 'include'`.
- SSR/server actions forward only needed cookies to the Gateway; UI never
  receives access/refresh tokens.
- Preserve form validation, loading, confirmation and generic error states.
- Make the API origin configurable for localhost and `api.tripz.vn`; do not
  use a public Supabase key for application auth/data requests after migration.

## 6. Database and ownership

| Fact | Owner | Change |
| --- | --- | --- |
| Supabase auth user/password/session | Supabase Auth | Gateway adapter only |
| Platform profile, role, status | Social Community context / `public.user_profiles` transitional store | add role/status constraints and audit table through immutable migration |
| Trip membership and permissions | Core Trip Service / `trip_schema` | no platform-role bypass |
| Admin role/status mutation log | Social Community context | immutable audit table and authorization tests |

The current `public.user_profiles` transitional location is retained only for
this slice. Moving it to `social_schema` requires a separate migration/ADR; the
Gateway will depend on an interface rather than its row shape.

## 7. Verification and rollout

- Unit: cookie policy, token parsing, CSRF/origin validation, role mapping.
- Integration: Supabase Auth adapter and profile authorization adapter against
  hosted staging credentials with secret-safe fixtures.
- Authorization matrix: Guest/User/Partner/Admin and Owner/Editor/Viewer,
  including inactive user and self-escalation attempts.
- Contract: generated `/api/v1/openapi.json` validates and represents every
  public route with non-empty schemas.
- E2E: register/confirm/login/create trip/edit as editor/deny viewer/logout;
  web runs with no direct Supabase requests.
- Roll out behind `BFF_AUTH_ENABLED`; observe auth failures, refresh failures,
  CSRF rejections and role-denial counts. Keep bearer compatibility for
  non-browser clients until they migrate.
