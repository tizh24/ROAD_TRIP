-- We put user_profiles in the public schema as it is shared
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id), -- Removed ON DELETE CASCADE to prevent accidental hard deletes
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    status TEXT DEFAULT 'ACTIVE', -- ACTIVE, BANNED, DELETED
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Block Hard Delete
-- No DELETE policy means DELETE is denied by default

-- Allow users to read active profiles
CREATE POLICY "Profiles are viewable if active"
    ON public.user_profiles FOR SELECT
    USING (status = 'ACTIVE');

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = id AND status = 'ACTIVE');

-- Trigger to sync auth.users with user_profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
