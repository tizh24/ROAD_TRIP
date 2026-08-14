# Supabase migration audit

**Audit date:** 2026-08-15  
**Scope:** Existing migrations and local seed before corrective database work  
**Decision:** Treat every listed migration version as immutable/applied

## Canonical apply order and baseline checksums

Supabase CLI applies the files lexicographically in this order:

| Order | Migration                                   | SHA-256                                                            | Audit result                                                         |
| ----- | ------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------- |
| 1     | `20240813170001_init_schemas_and_roles.sql` | `8EC07BFA2ABE53465398CB106955E3751648B560A27CF65F09A1CDF9DDACECCB` | Creates four schemas and service roles; incomplete privilege model   |
| 2     | `20240813170002_users_schema.sql`           | `D46146C36649F4AD1DD02184833B7CD759CEC15249381201CE30ED8BC476D447` | Creates profiles, trigger and broad active-profile read policy       |
| 3     | `20240813170003_trip_schema.sql`            | `28699EF1A759F330DF1D27D97394A14DC8B82E9AC2605FBC9F29C100518386DE` | Creates the legacy trip tables; missing current domain constraints   |
| 4     | `20240813170004_trip_rls_policies.sql`      | `0BAA1C61288535B74EDF00CB66B25BF100BB6DADD763493F810130FD9BF8B463` | Creates legacy MEMBER/ADMIN RLS policies and unsafe helper functions |
| 5     | `20260813095134_init_schemas_and_roles.sql` | `E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855` | Empty file; version is reserved and must not be repurposed           |

The 2026 filename duplicates the intent/name of the first 2024 migration, but it
does not duplicate SQL because it is zero bytes. Its risk is migration-history
drift: adding content later would run only on fresh databases and never on an
environment that already recorded this version. It therefore remains empty.

## Findings

### Schema, roles and grants

- `notification_schema` and its owning service role do not exist.
- `CREATE ROLE` is not rerun-safe when those cluster-level roles already exist.
  This matters when evaluating repeated local resets against the same PostgreSQL
  cluster, but the historical statement must not be edited.
- Existing grants cover schema usage and default table privileges only. They do
  not define least-privilege grants for existing objects, sequences or
  functions, and do not revoke PostgreSQL's default public function execution.
- Default privileges apply only to objects subsequently created by `postgres`;
  ownership assumptions are implicit.
- `trip_schema`, `social_schema`, `monetization_schema` and `geo_schema` are not
  exposed by local PostgREST configuration, which currently exposes only
  `public` and `graphql_public`. This is not changed by the audit.

### Profiles and trigger

- `public.handle_new_user()` is `SECURITY DEFINER` without a fixed empty/safe
  `search_path`, and its execute privilege is not restricted.
- Signup can fail when `raw_user_meta_data.full_name` is absent because
  `user_profiles.full_name` is `NOT NULL` with no fallback.
- The active-profile SELECT policy exposes email and other profile columns to
  every caller able to access the table; API serialization must not rely on this
  policy as a column allowlist.

### Core Trip tables

- `trips` lacks trimmed-title, date-range/30-day, non-negative-budget and status
  constraints. It also lacks `currency`, optimistic `version`, `deleted_at` and
  required indexes; legacy `budget` differs from planned `budget_amount`.
- `trip_members` uses legacy roles `OWNER`, `ADMIN`, `MEMBER` instead of separate
  `role` (`OWNER`/`MEMBER`) and `permission` (`VIEW`/`EDIT`). It lacks
  `updated_at` and a database guard for exactly one active owner.
- `trip_days` lacks uniqueness on `(trip_id, date)` and
  `(trip_id, day_index)`, positive one-based ordering and `updated_at`.
- `trip_stops.day_id` is nullable and the database does not prove that `day_id`
  belongs to the same `trip_id`. Coordinates and order are unconstrained; the
  planned `version`, `updated_at` and unique `(day_id, stop_index)` are absent.
- The trip owner references `public.user_profiles`, a cross-context foreign key
  that conflicts with the architecture's future-separation goal. It is retained
  until a corrective migration explicitly chooses a safe transition.

### RLS and helper functions

- All three trip helper functions are `SECURITY DEFINER` without a fixed
  `search_path`; default `PUBLIC` execute has not been revoked.
- Trip INSERT checks only that a user exists and does not require
  `owner_id = auth.uid()`.
- Legacy policies grant itinerary mutation to every active member, so a planned
  viewer can edit days/stops.
- Admin policies can mutate membership without the approved owner/editor/viewer
  permission matrix or owner-protection guard.
- Days/stops use `FOR ALL`; hard deletes are therefore permitted even though the
  schema carries status fields and the product requires auditable behavior.
- RLS is enabled but not forced. Table owners and privileged service credentials
  bypass it, so service authorization remains mandatory.

### Seed blockers

- The sample trip ID begins with `t`, which is not valid hexadecimal UUID
  syntax. References to it make the seed fail.
- The three-day sample trip creates only two days, violating the aggregate rule.
- Direct insertion into `auth.users` is coupled to Supabase's internal schema
  and does not create an identity row; authentication behavior must be verified
  against the installed CLI version.

The seed is not migration history and may be corrected, but it must not be used
to hide migration defects.

## Corrective-only strategy

No existing migration may be renamed, reordered, deleted or edited. New files
must use timestamps greater than `20260813095134` and be safe for both a database
that has the five recorded versions and a fresh database applying the full
chain.

1. **T020 — schemas and roles:** add notification ownership, explicit grants and
   default privileges; replace unsafe security-definer functions with fixed
   `search_path` and restricted execute grants. Handle pre-existing roles in new
   guarded statements rather than changing migration 1.
2. **T021 — Core Trip tables:** add/backfill columns before making them required;
   map legacy `ADMIN` to `MEMBER + EDIT` and legacy `MEMBER` to
   `MEMBER + VIEW`; add checks, unique constraints and indexes only after
   detecting invalid/duplicate rows. Do not silently discard production data.
3. **T022 — collaboration/outbox/notification:** create invitations, outbox,
   processed-event and delivery tables with their polling/idempotency indexes.
4. **T023 — RLS:** replace policies by stable names, align them with the approved
   owner/editor/viewer/outsider matrix, and test both user-scoped and privileged
   service paths.
5. Correct the local seed before declaring the clean-reset gate green.

If deployed data violates a new constraint, the migration must fail with a
diagnostic query or use an explicitly reviewed backfill. It must not coerce or
delete ambiguous data automatically.

## Clean-reset expectation

The database gate is green only when all of the following succeed against the
Supabase CLI version used by the project:

1. `supabase db reset` applies migrations 1 through 5, every corrective
   migration in timestamp order, and the seed without error.
2. A second `supabase db reset` succeeds against the same local Supabase stack,
   catching cluster-role and rerun assumptions.
3. `supabase migration list --local` reports the same ordered versions as the
   repository and no repaired/remote-only divergence.
4. Database lint and the constraint/RLS integration suites pass on the reset
   database.

The current baseline is intentionally **red** because the seed contains an
invalid UUID and the approved corrective migrations do not exist yet. Supabase
CLI is not installed in the present environment, so T019 records the audit and
expected gate; T020 onward must execute it rather than claiming reset success.
