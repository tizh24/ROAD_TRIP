BEGIN;

-- 1. Create immutable trip audit logs for visibility and collaboration tracking
CREATE TABLE IF NOT EXISTS trip_schema.trip_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trip_schema.trips(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  correlation_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_trip_audit_logs_trip_id
  ON trip_schema.trip_audit_logs (trip_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_trip_audit_logs_actor_id
  ON trip_schema.trip_audit_logs (actor_id);

-- 2. Enforce audit log immutability via trigger
CREATE OR REPLACE FUNCTION trip_schema.prevent_trip_audit_log_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Trip audit logs are immutable and cannot be updated or deleted.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_trip_audit_log_mutation ON trip_schema.trip_audit_logs;
CREATE TRIGGER trg_prevent_trip_audit_log_mutation
  BEFORE UPDATE OR DELETE ON trip_schema.trip_audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION trip_schema.prevent_trip_audit_log_mutation();

-- 3. Enable RLS and setup member-access policy
ALTER TABLE trip_schema.trip_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Trip members can view trip audit logs" ON trip_schema.trip_audit_logs;
CREATE POLICY "Trip members can view trip audit logs"
  ON trip_schema.trip_audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trip_schema.trip_members
      WHERE trip_id = trip_schema.trip_audit_logs.trip_id
        AND user_id = auth.uid()
        AND status = 'ACTIVE'
    )
    OR EXISTS (
      SELECT 1 FROM trip_schema.trips
      WHERE id = trip_schema.trip_audit_logs.trip_id
        AND owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Trip managers can insert trip audit logs" ON trip_schema.trip_audit_logs;
CREATE POLICY "Trip managers can insert trip audit logs"
  ON trip_schema.trip_audit_logs FOR INSERT
  WITH CHECK (
    auth.uid() = actor_id
  );

-- 4. Permissions
GRANT SELECT, INSERT ON TABLE trip_schema.trip_audit_logs TO authenticated;
GRANT ALL ON TABLE trip_schema.trip_audit_logs TO service_role;

COMMIT;
