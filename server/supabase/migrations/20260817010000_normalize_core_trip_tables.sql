BEGIN;

ALTER TABLE trip_schema.trips RENAME COLUMN budget TO budget_amount;
ALTER TABLE trip_schema.trip_stops RENAME COLUMN lat TO latitude;
ALTER TABLE trip_schema.trip_stops RENAME COLUMN lng TO longitude;

ALTER TABLE trip_schema.trips
  ADD COLUMN currency text,
  ADD COLUMN version integer,
  ADD COLUMN deleted_at timestamptz;

ALTER TABLE trip_schema.trip_members
  ADD COLUMN permission text,
  ADD COLUMN updated_at timestamptz;

ALTER TABLE trip_schema.trip_days
  ADD COLUMN updated_at timestamptz;

ALTER TABLE trip_schema.trip_stops
  ADD COLUMN version integer,
  ADD COLUMN updated_at timestamptz;

UPDATE trip_schema.trips
SET
  status = COALESCE(status, 'PLANNING'),
  budget_amount = COALESCE(budget_amount, 0),
  currency = 'VND',
  version = 1,
  created_at = COALESCE(created_at, now()),
  updated_at = COALESCE(updated_at, created_at, now()),
  deleted_at = CASE
    WHEN status = 'DELETED' THEN COALESCE(updated_at, created_at, now())
    ELSE NULL
  END;

UPDATE trip_schema.trip_members
SET
  permission = CASE role
    WHEN 'OWNER' THEN 'EDIT'
    WHEN 'ADMIN' THEN 'EDIT'
    ELSE 'VIEW'
  END,
  role = CASE role
    WHEN 'ADMIN' THEN 'MEMBER'
    ELSE COALESCE(role, 'MEMBER')
  END,
  status = COALESCE(status, 'ACTIVE'),
  joined_at = COALESCE(joined_at, now()),
  updated_at = COALESCE(joined_at, now());

UPDATE trip_schema.trip_days
SET
  status = COALESCE(status, 'ACTIVE'),
  created_at = COALESCE(created_at, now()),
  updated_at = COALESCE(created_at, now());

UPDATE trip_schema.trip_stops
SET
  status = COALESCE(status, 'ACTIVE'),
  version = 1,
  created_at = COALESCE(created_at, now()),
  updated_at = COALESCE(created_at, now());

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM trip_schema.trips
    WHERE btrim(title) = ''
      OR char_length(btrim(title)) > 120
      OR end_date < start_date
      OR end_date - start_date > 29
      OR budget_amount < 0
  ) THEN
    RAISE EXCEPTION 'Core Trip migration blocked: invalid trip title, date range, or budget';
  END IF;

  IF EXISTS (
    SELECT trip_id
    FROM trip_schema.trip_members
    WHERE role = 'OWNER' AND status = 'ACTIVE'
    GROUP BY trip_id
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'Core Trip migration blocked: a trip has multiple active owners';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM trip_schema.trip_days
    WHERE day_index < 1
  ) OR EXISTS (
    SELECT 1
    FROM trip_schema.trip_days d
    JOIN trip_schema.trips t ON t.id = d.trip_id
    WHERE d.date < t.start_date OR d.date > t.end_date
  ) THEN
    RAISE EXCEPTION 'Core Trip migration blocked: invalid trip day date or order';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM trip_schema.trip_stops s
    LEFT JOIN trip_schema.trip_days d
      ON d.id = s.day_id AND d.trip_id = s.trip_id
    WHERE s.day_id IS NULL
      OR d.id IS NULL
      OR s.stop_index < 1
      OR s.latitude NOT BETWEEN -90 AND 90
      OR s.longitude NOT BETWEEN -180 AND 180
  ) THEN
    RAISE EXCEPTION 'Core Trip migration blocked: invalid stop day, order, or coordinate';
  END IF;
END
$$;

ALTER TABLE trip_schema.trips
  ALTER COLUMN status SET DEFAULT 'PLANNING',
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN budget_amount SET DEFAULT 0,
  ALTER COLUMN budget_amount SET NOT NULL,
  ALTER COLUMN currency SET DEFAULT 'VND',
  ALTER COLUMN currency SET NOT NULL,
  ALTER COLUMN version SET DEFAULT 1,
  ALTER COLUMN version SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET NOT NULL,
  ADD CONSTRAINT trips_title_check
    CHECK (btrim(title) <> '' AND char_length(btrim(title)) <= 120),
  ADD CONSTRAINT trips_date_range_check
    CHECK (end_date >= start_date AND end_date - start_date <= 29),
  ADD CONSTRAINT trips_status_check
    CHECK (status IN ('PLANNING', 'ONGOING', 'COMPLETED', 'CANCELLED', 'DELETED')),
  ADD CONSTRAINT trips_budget_amount_check CHECK (budget_amount >= 0),
  ADD CONSTRAINT trips_currency_check CHECK (currency ~ '^[A-Z]{3}$'),
  ADD CONSTRAINT trips_version_check CHECK (version >= 1),
  ADD CONSTRAINT trips_deleted_at_check
    CHECK ((status = 'DELETED') = (deleted_at IS NOT NULL));

ALTER TABLE trip_schema.trip_members
  ALTER COLUMN role SET DEFAULT 'MEMBER',
  ALTER COLUMN role SET NOT NULL,
  ALTER COLUMN permission SET DEFAULT 'VIEW',
  ALTER COLUMN permission SET NOT NULL,
  ALTER COLUMN status SET DEFAULT 'ACTIVE',
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN joined_at SET DEFAULT now(),
  ALTER COLUMN joined_at SET NOT NULL,
  ALTER COLUMN updated_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET NOT NULL,
  ADD CONSTRAINT trip_members_role_check CHECK (role IN ('OWNER', 'MEMBER')),
  ADD CONSTRAINT trip_members_permission_check CHECK (permission IN ('VIEW', 'EDIT')),
  ADD CONSTRAINT trip_members_status_check CHECK (status IN ('ACTIVE', 'LEFT', 'REMOVED')),
  ADD CONSTRAINT trip_members_owner_permission_check
    CHECK (role <> 'OWNER' OR permission = 'EDIT');

ALTER TABLE trip_schema.trip_days
  ALTER COLUMN status SET DEFAULT 'ACTIVE',
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET NOT NULL,
  ADD CONSTRAINT trip_days_day_index_check CHECK (day_index >= 1),
  ADD CONSTRAINT trip_days_status_check CHECK (status IN ('ACTIVE', 'DELETED')),
  ADD CONSTRAINT trip_days_trip_id_date_key UNIQUE (trip_id, date),
  ADD CONSTRAINT trip_days_trip_id_day_index_key UNIQUE (trip_id, day_index),
  ADD CONSTRAINT trip_days_trip_id_id_key UNIQUE (trip_id, id);

ALTER TABLE trip_schema.trip_stops
  ALTER COLUMN day_id SET NOT NULL,
  ALTER COLUMN status SET DEFAULT 'ACTIVE',
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN version SET DEFAULT 1,
  ALTER COLUMN version SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET NOT NULL,
  ADD CONSTRAINT trip_stops_place_id_check CHECK (btrim(place_id) <> ''),
  ADD CONSTRAINT trip_stops_name_check CHECK (btrim(name) <> ''),
  ADD CONSTRAINT trip_stops_latitude_check CHECK (latitude BETWEEN -90 AND 90),
  ADD CONSTRAINT trip_stops_longitude_check CHECK (longitude BETWEEN -180 AND 180),
  ADD CONSTRAINT trip_stops_stop_index_check CHECK (stop_index >= 1),
  ADD CONSTRAINT trip_stops_time_range_check
    CHECK (
      arrival_time IS NULL
      OR departure_time IS NULL
      OR departure_time >= arrival_time
    ),
  ADD CONSTRAINT trip_stops_status_check CHECK (status IN ('ACTIVE', 'DELETED')),
  ADD CONSTRAINT trip_stops_version_check CHECK (version >= 1),
  ADD CONSTRAINT trip_stops_day_id_stop_index_key UNIQUE (day_id, stop_index);

ALTER TABLE trip_schema.trip_stops
  DROP CONSTRAINT trip_stops_day_id_fkey,
  ADD CONSTRAINT trip_stops_trip_day_fkey
    FOREIGN KEY (trip_id, day_id)
    REFERENCES trip_schema.trip_days (trip_id, id)
    ON DELETE CASCADE;

CREATE UNIQUE INDEX trip_members_one_active_owner_idx
  ON trip_schema.trip_members (trip_id)
  WHERE role = 'OWNER' AND status = 'ACTIVE';

CREATE INDEX trips_owner_status_idx
  ON trip_schema.trips (owner_id, status);
CREATE INDEX trips_date_range_idx
  ON trip_schema.trips (start_date, end_date);
CREATE INDEX trips_updated_at_idx
  ON trip_schema.trips (updated_at DESC);
CREATE INDEX trip_members_user_status_idx
  ON trip_schema.trip_members (user_id, status);
CREATE INDEX trip_days_trip_id_idx
  ON trip_schema.trip_days (trip_id);
CREATE INDEX trip_stops_trip_day_idx
  ON trip_schema.trip_stops (trip_id, day_id);

CREATE FUNCTION trip_schema.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION trip_schema.set_updated_at() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION trip_schema.set_updated_at() TO trip_service_role;

CREATE TRIGGER trips_set_updated_at
  BEFORE UPDATE ON trip_schema.trips
  FOR EACH ROW EXECUTE FUNCTION trip_schema.set_updated_at();
CREATE TRIGGER trip_members_set_updated_at
  BEFORE UPDATE ON trip_schema.trip_members
  FOR EACH ROW EXECUTE FUNCTION trip_schema.set_updated_at();
CREATE TRIGGER trip_days_set_updated_at
  BEFORE UPDATE ON trip_schema.trip_days
  FOR EACH ROW EXECUTE FUNCTION trip_schema.set_updated_at();
CREATE TRIGGER trip_stops_set_updated_at
  BEFORE UPDATE ON trip_schema.trip_stops
  FOR EACH ROW EXECUTE FUNCTION trip_schema.set_updated_at();

COMMIT;
