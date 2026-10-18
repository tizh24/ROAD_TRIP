-- Migration: 20261018030000_add_slice_3_memory_expenses_tracking.sql
-- Slice 3: On-road consented tracking, Trip Memories, Photos, and Expenses ledger

-- 1. Trip Memories table
CREATE TABLE IF NOT EXISTS trip_schema.trip_memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES trip_schema.trips(id) ON DELETE CASCADE,
  title text NOT NULL,
  summary text,
  cover_photo_url text,
  visibility text NOT NULL DEFAULT 'PRIVATE' CHECK (visibility IN ('PRIVATE', 'UNLISTED', 'PUBLISHED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT trip_memories_trip_id_key UNIQUE (trip_id)
);

-- 2. Trip Memory Photos table
CREATE TABLE IF NOT EXISTS trip_schema.trip_memory_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id uuid NOT NULL REFERENCES trip_schema.trip_memories(id) ON DELETE CASCADE,
  photo_url text NOT NULL,
  caption text,
  taken_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Trip Expenses ledger table
CREATE TABLE IF NOT EXISTS trip_schema.trip_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES trip_schema.trips(id) ON DELETE CASCADE,
  payer_id uuid NOT NULL REFERENCES auth.users(id),
  amount numeric(14, 2) NOT NULL CHECK (amount > 0),
  currency text NOT NULL DEFAULT 'VND',
  category text NOT NULL DEFAULT 'FOOD' CHECK (category IN ('FOOD', 'STAY', 'FUEL', 'ACTIVITY', 'OTHER')),
  description text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Trip Live Locations (consented member tracking)
CREATE TABLE IF NOT EXISTS trip_schema.trip_live_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES trip_schema.trips(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  latitude numeric(10, 7) NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
  longitude numeric(10, 7) NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
  sharing_active boolean NOT NULL DEFAULT true,
  consent_given boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT trip_live_locations_trip_user_key UNIQUE (trip_id, user_id)
);

-- Enable RLS
ALTER TABLE trip_schema.trip_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_schema.trip_memory_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_schema.trip_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_schema.trip_live_locations ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE trip_schema.trip_memories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE trip_schema.trip_memory_photos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE trip_schema.trip_expenses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE trip_schema.trip_live_locations TO authenticated;

-- Policies for trip_memories: members can read; owner/editors can insert/update
CREATE POLICY trip_memories_select_policy ON trip_schema.trip_memories
  FOR SELECT TO authenticated
  USING (
    visibility = 'PUBLISHED'
    OR visibility = 'UNLISTED'
    OR EXISTS (
      SELECT 1 FROM trip_schema.trip_members tm
      WHERE tm.trip_id = trip_memories.trip_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'ACTIVE'
    )
    OR EXISTS (
      SELECT 1 FROM trip_schema.trips t
      WHERE t.id = trip_memories.trip_id
        AND t.owner_id = auth.uid()
        AND t.deleted_at IS NULL
    )
  );

CREATE POLICY trip_memories_modify_policy ON trip_schema.trip_memories
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trip_schema.trips t
      WHERE t.id = trip_memories.trip_id
        AND t.owner_id = auth.uid()
        AND t.deleted_at IS NULL
    )
    OR EXISTS (
      SELECT 1 FROM trip_schema.trip_members tm
      WHERE tm.trip_id = trip_memories.trip_id
        AND tm.user_id = auth.uid()
        AND tm.permission = 'EDIT'
        AND tm.status = 'ACTIVE'
    )
  );

-- Policies for trip_expenses: trip members can read and create/delete their own
CREATE POLICY trip_expenses_select_policy ON trip_schema.trip_expenses
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trip_schema.trip_members tm
      WHERE tm.trip_id = trip_expenses.trip_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'ACTIVE'
    )
    OR EXISTS (
      SELECT 1 FROM trip_schema.trips t
      WHERE t.id = trip_expenses.trip_id
        AND t.owner_id = auth.uid()
        AND t.deleted_at IS NULL
    )
  );

CREATE POLICY trip_expenses_insert_policy ON trip_schema.trip_expenses
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = payer_id
    AND (
      EXISTS (
        SELECT 1 FROM trip_schema.trip_members tm
        WHERE tm.trip_id = trip_expenses.trip_id
          AND tm.user_id = auth.uid()
          AND tm.status = 'ACTIVE'
      )
      OR EXISTS (
        SELECT 1 FROM trip_schema.trips t
        WHERE t.id = trip_expenses.trip_id
          AND t.owner_id = auth.uid()
          AND t.deleted_at IS NULL
      )
    )
  );

-- Policies for trip_live_locations: trip members only, users manage their own row
CREATE POLICY trip_live_locations_select_policy ON trip_schema.trip_live_locations
  FOR SELECT TO authenticated
  USING (
    sharing_active = true
    AND (
      EXISTS (
        SELECT 1 FROM trip_schema.trip_members tm
        WHERE tm.trip_id = trip_live_locations.trip_id
          AND tm.user_id = auth.uid()
          AND tm.status = 'ACTIVE'
      )
      OR EXISTS (
        SELECT 1 FROM trip_schema.trips t
        WHERE t.id = trip_live_locations.trip_id
          AND t.owner_id = auth.uid()
          AND t.deleted_at IS NULL
      )
    )
  );

CREATE POLICY trip_live_locations_modify_policy ON trip_schema.trip_live_locations
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
