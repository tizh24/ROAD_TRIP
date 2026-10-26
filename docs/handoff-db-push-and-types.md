# Handoff: push 6 migrations to `roadtrip-dev` and regenerate DB types

Context: `supabase db push --linked --dry-run` (2026-10-27) showed these migrations are
not yet on the hosted project `roadtrip-dev` (ref `vtagtejhrdqwvdrooyqz`). All are additive.

1. 20261018010000_platform_role_moderator_and_audit_records.sql
2. 20261018020000_add_trip_visibility_and_audit.sql
3. 20261018030000_add_slice_3_memory_expenses_tracking.sql
4. 20261018040000_add_slice_4_community_and_social.sql (now creates `users_schema`)
5. 20261018050000_add_slice_5_partner_and_listings.sql
6. 20261018060000_add_slice_6_billing_and_travel_books.sql

## Steps (run from `server/`)

1. `npx supabase migration list --linked` – confirm remote ends at `20261018000000`.
2. `npx supabase db push --linked --dry-run` – confirm exactly the six files above.
3. `npx supabase db push --linked` – apply. Do not use `db reset`; never edit applied migrations.
4. `npx supabase gen types typescript --linked --schema public --schema trip_schema --schema notification_schema --schema community_schema --schema partner_schema --schema billing_schema --schema users_schema > packages/db-client/src/database.types.ts`
   then `npx prettier --write packages/db-client/src/database.types.ts`.
5. `pnpm typecheck && pnpm lint && pnpm test`.
6. Do not print secrets from `.env.hosted.local`.

Then tick in `docs/specs/platform-api-contract/tasks.md`: "Add immutable migration ... regenerate database types".

Known risk: if step 3 fails on `users_schema` / grants, report the exact error; do not hand-edit remote.
