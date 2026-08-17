BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;
SET search_path TO public, extensions;

SELECT plan(16);

INSERT INTO trip_schema.trips (
  id,
  owner_id,
  title,
  start_date,
  end_date
)
VALUES (
  'c1b2c3d4-e5f6-4a5b-8c9d-0123456789ab',
  'a1b2c3d4-e5f6-4a5b-8c9d-0123456789ab',
  'Constraint test trip',
  '2026-10-01',
  '2026-10-01'
);

INSERT INTO trip_schema.trip_days (id, trip_id, date, day_index)
VALUES (
  'e1b2c3d4-e5f6-4a5b-8c9d-0123456789ab',
  'c1b2c3d4-e5f6-4a5b-8c9d-0123456789ab',
  '2026-10-01',
  1
);

SELECT has_column(
  'trip_schema',
  'trips',
  'budget_amount',
  'trips use the normalized budget_amount column'
);

SELECT has_column(
  'trip_schema',
  'trip_stops',
  'latitude',
  'stops use the normalized latitude column'
);

SELECT throws_ok(
  $$
    UPDATE trip_schema.trips
    SET title = repeat('x', 121)
    WHERE id = 'b1b2c3d4-e5f6-4a5b-8c9d-0123456789ab'
  $$,
  '23514',
  NULL,
  'trip title cannot exceed the contract limit'
);

SELECT throws_ok(
  $$
    UPDATE trip_schema.trips
    SET end_date = start_date - 1
    WHERE id = 'b1b2c3d4-e5f6-4a5b-8c9d-0123456789ab'
  $$,
  '23514',
  NULL,
  'trip end date cannot precede start date'
);

SELECT throws_ok(
  $$
    UPDATE trip_schema.trips
    SET end_date = start_date + 30
    WHERE id = 'b1b2c3d4-e5f6-4a5b-8c9d-0123456789ab'
  $$,
  '23514',
  NULL,
  'trip cannot exceed 30 inclusive calendar days'
);

SELECT throws_ok(
  $$
    UPDATE trip_schema.trips
    SET budget_amount = -0.01
    WHERE id = 'b1b2c3d4-e5f6-4a5b-8c9d-0123456789ab'
  $$,
  '23514',
  NULL,
  'trip budget cannot be negative'
);

SELECT throws_ok(
  $$
    UPDATE trip_schema.trips
    SET currency = 'vnd'
    WHERE id = 'b1b2c3d4-e5f6-4a5b-8c9d-0123456789ab'
  $$,
  '23514',
  NULL,
  'currency must be a three-letter uppercase code'
);

SELECT throws_ok(
  $$
    UPDATE trip_schema.trips
    SET version = 0
    WHERE id = 'b1b2c3d4-e5f6-4a5b-8c9d-0123456789ab'
  $$,
  '23514',
  NULL,
  'optimistic lock version must remain positive'
);

SELECT throws_ok(
  $$
    UPDATE trip_schema.trip_members
    SET role = 'ADMIN'
    WHERE trip_id = 'b1b2c3d4-e5f6-4a5b-8c9d-0123456789ab'
  $$,
  '23514',
  NULL,
  'legacy ADMIN member role is rejected'
);

SELECT throws_ok(
  $$
    UPDATE trip_schema.trip_days
    SET day_index = 0
    WHERE id = 'd1b2c3d4-e5f6-4a5b-8c9d-0123456789ab'
  $$,
  '23514',
  NULL,
  'day order is one-based'
);

SELECT throws_ok(
  $$
    UPDATE trip_schema.trip_stops
    SET stop_index = 1
    WHERE place_id = 'place_2'
  $$,
  '23505',
  NULL,
  'stop order is unique within a day'
);

SELECT throws_ok(
  $$
    UPDATE trip_schema.trip_stops
    SET day_id = 'e1b2c3d4-e5f6-4a5b-8c9d-0123456789ab'
    WHERE place_id = 'place_1'
  $$,
  '23503',
  NULL,
  'a stop cannot reference a day from another trip'
);

SELECT throws_ok(
  $$
    UPDATE trip_schema.trip_stops
    SET latitude = 90.0000001
    WHERE place_id = 'place_1'
  $$,
  '23514',
  NULL,
  'latitude outside the valid range is rejected'
);

SELECT throws_ok(
  $$
    UPDATE trip_schema.trip_stops
    SET longitude = -180.0000001
    WHERE place_id = 'place_1'
  $$,
  '23514',
  NULL,
  'longitude outside the valid range is rejected'
);

SELECT throws_ok(
  $$
    UPDATE trip_schema.trips
    SET status = 'DELETED', deleted_at = NULL
    WHERE id = 'b1b2c3d4-e5f6-4a5b-8c9d-0123456789ab'
  $$,
  '23514',
  NULL,
  'soft-deleted trips require deleted_at metadata'
);

UPDATE trip_schema.trips
SET updated_at = '2000-01-01 00:00:00+00'
WHERE id = 'b1b2c3d4-e5f6-4a5b-8c9d-0123456789ab';

SELECT ok(
  (
    SELECT updated_at > '2000-01-01 00:00:00+00'
    FROM trip_schema.trips
    WHERE id = 'b1b2c3d4-e5f6-4a5b-8c9d-0123456789ab'
  ),
  'updated_at trigger overrides stale client timestamps'
);

SELECT * FROM finish();

ROLLBACK;
