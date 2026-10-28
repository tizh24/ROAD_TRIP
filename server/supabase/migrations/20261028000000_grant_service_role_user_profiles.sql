BEGIN;

-- The API gateway enriches every authenticated request from this table using
-- the Supabase service-role key. Keep that server-only path explicit while
-- leaving browser access governed by RLS policies.
GRANT SELECT, UPDATE ON TABLE public.user_profiles TO service_role;

COMMIT;
