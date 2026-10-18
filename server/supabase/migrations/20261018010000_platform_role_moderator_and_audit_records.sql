BEGIN;

-- 1. Expand platform roles to include MODERATOR
ALTER TABLE public.user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_role_check;

ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_role_check
  CHECK (role IN ('USER', 'PARTNER', 'MODERATOR', 'ADMIN'));

-- 2. Create immutable platform audit log records
CREATE TABLE IF NOT EXISTS public.platform_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  correlation_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for audit querying and traceability
CREATE INDEX IF NOT EXISTS idx_platform_audit_logs_actor 
  ON public.platform_audit_logs (actor_id);

CREATE INDEX IF NOT EXISTS idx_platform_audit_logs_entity 
  ON public.platform_audit_logs (entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_platform_audit_logs_created_at 
  ON public.platform_audit_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_platform_audit_logs_correlation_id 
  ON public.platform_audit_logs (correlation_id) 
  WHERE correlation_id IS NOT NULL;

-- 3. Enforce immutability via database trigger (strictly prevent UPDATE and DELETE)
CREATE OR REPLACE FUNCTION public.prevent_audit_log_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Platform audit logs are immutable and cannot be updated or deleted.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_platform_audit_log_mutation ON public.platform_audit_logs;
CREATE TRIGGER trg_prevent_platform_audit_log_mutation
  BEFORE UPDATE OR DELETE ON public.platform_audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_audit_log_mutation();

-- 4. Enable RLS and setup least-privilege security policies
ALTER TABLE public.platform_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view platform audit logs" ON public.platform_audit_logs;
CREATE POLICY "Admins can view platform audit logs"
  ON public.platform_audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'ADMIN' AND status = 'ACTIVE'
    )
  );

DROP POLICY IF EXISTS "Admins can insert platform audit logs" ON public.platform_audit_logs;
CREATE POLICY "Admins can insert platform audit logs"
  ON public.platform_audit_logs FOR INSERT
  WITH CHECK (
    auth.uid() = actor_id AND EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'ADMIN' AND status = 'ACTIVE'
    )
  );

-- 5. Grant access permissions
GRANT SELECT, INSERT ON TABLE public.platform_audit_logs TO authenticated;
GRANT ALL ON TABLE public.platform_audit_logs TO service_role;

COMMIT;
