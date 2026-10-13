BEGIN;

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS role TEXT;

UPDATE public.user_profiles
SET role = 'USER'
WHERE role IS NULL;

ALTER TABLE public.user_profiles
  ALTER COLUMN role SET DEFAULT 'USER',
  ALTER COLUMN role SET NOT NULL;

ALTER TABLE public.user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_role_check;

ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_role_check
  CHECK (role IN ('USER', 'PARTNER', 'ADMIN'));

-- A profile owner may update presentation fields, never their application role,
-- account status, or email address. Privileged role changes are operational DB work.
REVOKE UPDATE ON TABLE public.user_profiles FROM authenticated;
GRANT UPDATE (full_name, avatar_url, updated_at) ON TABLE public.user_profiles TO authenticated;

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id AND status = 'ACTIVE')
  WITH CHECK (auth.uid() = id AND status = 'ACTIVE');

COMMIT;
