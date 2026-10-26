# Gateway configuration and deployment

The Gateway validates its environment at startup (`server/packages/config`,
`gatewayConfigSchema`). Startup fails with the **names** of invalid variables;
values are never printed. Secrets live only in the host secret manager
(Infisical/Railway), never in `NEXT_PUBLIC_*` or tracked files.

## Server-only secrets (Gateway)

| Variable | Notes |
| --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | Profile role/status reads and audited writes. Server-only. |
| `SUPABASE_PUBLISHABLE_KEY` | Used by the Gateway's Supabase Auth adapter. |
| `SUPABASE_JWT_SECRET` | Only for legacy HS256 projects (min 32 chars). |
| `INTERNAL_SERVICE_TOKEN` | Min 32 chars; shared with Core Trip and Geo. |
| `PAYMENT_WEBHOOK_SECRET` | Min 32 chars; unset disables `/billing/webhook`. |

## Session, cookie and CSRF settings

| Variable | Default | Rule |
| --- | --- | --- |
| `AUTH_COOKIE_SECURE` | `true` | **Must be `true` in any HTTPS deployment.** `false` is for local HTTP only. |
| `AUTH_ACCESS_COOKIE_NAME` | `__Secure-rt_access` | `__Secure-`/`__Host-` names require `AUTH_COOKIE_SECURE=true`. |
| `AUTH_REFRESH_COOKIE_NAME` | `__Secure-rt_refresh` | Path `/api/v1/auth`. Names must be distinct. |
| `CSRF_COOKIE_NAME` | `__Secure-rt_csrf` | Readable by the web (double-submit token). |
| `AUTH_COOKIE_DOMAIN` | unset | Bare host (e.g. `tripz.vn`) for sibling `api.`/web subdomains; no scheme/port. |
| `AUTH_ACCESS_COOKIE_MAX_AGE_SECONDS` | `900` | Capped by the provider token lifetime. |
| `AUTH_REFRESH_COOKIE_MAX_AGE_SECONDS` | `2592000` | Also the CSRF cookie lifetime. |
| `CORS_ALLOWED_ORIGINS` | required | Exact origins, comma-separated; `*` is rejected. Also the CSRF origin allowlist. |
| `PUBLIC_WEB_ORIGIN` | first CORS origin | Return origin for password-recovery e-mails (`/auth/recovery`); must be listed in `CORS_ALLOWED_ORIGINS`. |

The web must be built with matching `NEXT_PUBLIC_AUTH_ACCESS_COOKIE_NAME`,
`NEXT_PUBLIC_AUTH_REFRESH_COOKIE_NAME` and `NEXT_PUBLIC_CSRF_COOKIE_NAME` when
the defaults are overridden, and `NEXT_PUBLIC_API_URL` pointing at
`<gateway>/api/v1`.

Supabase must allow `<PUBLIC_WEB_ORIGIN>/auth/recovery` as a redirect URL.

## Profiles

- Local HTTP: `server/.env.example` (non-prefixed names, `AUTH_COOKIE_SECURE=false`).
- Hosted native development: copy `server/.env.hosted.example` to the ignored
  `.env.hosted.local`; see `docs/specs/hosted-native-development/`.
- Staging/production: set secrets in the host; use the default prefixed names and
  HTTPS. Roll out behind `BFF_AUTH_ENABLED` is not implemented; the cookie BFF is
  always on and bearer tokens remain accepted for non-browser clients.

## Verification checklist

1. `pnpm --dir server test` (config rules are covered by `packages/config`).
2. `GET /health/ready` and `/api/docs` on the Gateway.
3. Login in the browser sets three cookies; `POST` without `X-CSRF-Token` returns 403.
