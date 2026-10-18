BEGIN;

ALTER TABLE trip_schema.trips
  ADD COLUMN visibility text NOT NULL DEFAULT 'PRIVATE',
  ADD COLUMN source_trip_id uuid NULL REFERENCES trip_schema.trips(id) ON DELETE SET NULL,
  ADD COLUMN published_at timestamptz NULL;

ALTER TABLE trip_schema.trips
  ADD CONSTRAINT trips_visibility_check
    CHECK (visibility IN ('PRIVATE', 'UNLISTED', 'PUBLISHED')),
  ADD CONSTRAINT trips_published_at_check
    CHECK ((visibility = 'PUBLISHED') = (published_at IS NOT NULL));

CREATE INDEX trips_public_discovery_idx
  ON trip_schema.trips (published_at DESC)
  WHERE visibility = 'PUBLISHED' AND deleted_at IS NULL;

CREATE INDEX trips_source_trip_idx
  ON trip_schema.trips (source_trip_id)
  WHERE source_trip_id IS NOT NULL;

COMMIT;
