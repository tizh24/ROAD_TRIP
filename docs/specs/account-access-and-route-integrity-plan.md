# Tripz Account Access & Route Integrity — Implementation Plan

## Architecture decisions

1. **Identity remains Supabase Auth.** Next.js server actions use the existing SSR client. Passwords are submitted only to Supabase Auth and are never persisted in application tables.
2. **Roles belong to the shared profile record.** A new immutable migration adds `role text not null default 'USER'` to `public.user_profiles`, backfills existing rows, and constrains values to `USER`, `PARTNER`, and `ADMIN`.
3. **Profile owners cannot mutate roles.** The migration revokes broad table update from `authenticated`, grants column-limited updates only for `full_name`, `avatar_url`, and `updated_at`, and preserves the row-level policy. Privileged role assignment remains an administrative database operation.
4. **Two authorization layers.** Middleware redirects unauthenticated requests before rendering. Server-only helpers query the current user/profile and enforce the expected role in partner/admin layouts. This preserves defense in depth if middleware matching changes.
5. **No invented app data.** Route clean-up converts unsupported actions to safe links or non-interactive availability copy. Persisted trip flows remain untouched.

## Data migration

Create `server/supabase/migrations/<timestamp>_profile_roles.sql`:

- Add and backfill `role`.
- Add a named check constraint for the three valid values.
- Harden table-level/column-level update grants for the `authenticated` role.
- Recreate the own-profile update policy with `WITH CHECK (auth.uid() = id AND status = 'ACTIVE')`.
- Do not edit existing migrations or grant anonymous/public update rights.

## Web implementation

### Authentication feature

- Keep common validation helpers and user-safe messages in `features/auth`.
- Add server actions: `signUp`, `requestPasswordReset`, `updatePassword`, and `updateProfileName`.
- Add reusable form primitives only inside the auth feature; do not alter global component behavior for unrelated pages.
- Use `emailRedirectTo` derived from configured request origin, targeting `/auth/callback?next=/reset-password` for recovery. The callback already exchanges Supabase code for a session.
- Add pages and views for sign-up, request-reset, and reset-password; update login links.

### Authorization

- Replace the narrow trip regex with an explicit protected-route matcher covering authenticated traveler routes and privileged portal prefixes.
- Add server-only `requireAuthenticatedUser` and `requireRole` helpers. The latter loads the caller's own `user_profiles.role`, redirects unauthenticated callers to login, and returns `notFound()` for role mismatch to avoid confirming privileged portal availability.
- Convert partner/admin layouts to async server components and call the helper before rendering their shells.

### Route integrity

- Update planner alias behavior to clearly take signed-in users to the persisted trip list/new-trip workflow.
- Replace static-only route controls that look actionable with honest availability states or actual existing links. Do not rewrite a page into a fake data product.
- Profile settings gets a small persisted display-name form and a link to the password-recovery path; billing remains unchanged except for verified navigation/access behavior.

## Verification

- Unit tests for safe path behavior and validation/action helper outputs where possible without external services.
- SQL test or migration inspection verifies valid roles and denied direct role update.
- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` in `web/`.
- Run migration status and an approved metadata-only remote check; do not dump hosted rows or credentials.
- Use available browser automation for unauthenticated redirects, all auth views, mobile menu behavior, and privileged-route denial at representative mobile and desktop widths.

## Rollout and rollback

- The migration is additive and defaults all current users to `USER`, so existing traveler functionality continues.
- If a web deployment must be rolled back after migration, the old application ignores the additional role column safely.
- The database migration itself remains immutable; a future correction requires a new migration.
