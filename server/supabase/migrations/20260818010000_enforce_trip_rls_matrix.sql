BEGIN;

DROP POLICY IF EXISTS "Users can view active trips they own or joined"
  ON trip_schema.trips;
DROP POLICY IF EXISTS "Authenticated users can create trips"
  ON trip_schema.trips;
DROP POLICY IF EXISTS "Admins and Owners can update trip details"
  ON trip_schema.trips;
DROP POLICY IF EXISTS "Active members can view trip members"
  ON trip_schema.trip_members;
DROP POLICY IF EXISTS "Admins can add members"
  ON trip_schema.trip_members;
DROP POLICY IF EXISTS "Admins can update members"
  ON trip_schema.trip_members;
DROP POLICY IF EXISTS "Users can leave trip (Soft delete)"
  ON trip_schema.trip_members;
DROP POLICY IF EXISTS "Members can view active days"
  ON trip_schema.trip_days;
DROP POLICY IF EXISTS "Members can view active stops"
  ON trip_schema.trip_stops;
DROP POLICY IF EXISTS "Members can manage active days"
  ON trip_schema.trip_days;
DROP POLICY IF EXISTS "Members can manage active stops"
  ON trip_schema.trip_stops;

CREATE OR REPLACE FUNCTION trip_schema.trip_access_level(target_trip_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT CASE
    WHEN trip.owner_id = auth.uid() THEN 'OWNER'
    WHEN member.permission = 'EDIT' THEN 'EDIT'
    WHEN member.permission = 'VIEW' THEN 'VIEW'
    ELSE NULL
  END
  FROM trip_schema.trips AS trip
  LEFT JOIN trip_schema.trip_members AS member
    ON member.trip_id = trip.id
    AND member.user_id = auth.uid()
    AND member.status = 'ACTIVE'
  WHERE trip.id = target_trip_id
    AND trip.status <> 'DELETED'
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION trip_schema.is_trip_owner(trip_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT trip_schema.trip_access_level(trip_id) = 'OWNER'
$$;

CREATE OR REPLACE FUNCTION trip_schema.is_trip_editor(target_trip_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT trip_schema.trip_access_level(target_trip_id) IN ('OWNER', 'EDIT')
$$;

CREATE OR REPLACE FUNCTION trip_schema.is_trip_member(target_trip_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT trip_schema.trip_access_level(target_trip_id) IS NOT NULL
$$;

CREATE OR REPLACE FUNCTION trip_schema.is_trip_admin(target_trip_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT trip_schema.is_trip_editor(target_trip_id)
$$;

ALTER FUNCTION trip_schema.trip_access_level(uuid) OWNER TO postgres;
ALTER FUNCTION trip_schema.is_trip_owner(uuid) OWNER TO postgres;
ALTER FUNCTION trip_schema.is_trip_editor(uuid) OWNER TO postgres;
ALTER FUNCTION trip_schema.is_trip_member(uuid) OWNER TO postgres;
ALTER FUNCTION trip_schema.is_trip_admin(uuid) OWNER TO postgres;

REVOKE ALL ON FUNCTION trip_schema.trip_access_level(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION trip_schema.is_trip_owner(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION trip_schema.is_trip_editor(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION trip_schema.is_trip_member(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION trip_schema.is_trip_admin(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION trip_schema.trip_access_level(uuid)
  TO authenticated, service_role, trip_service_role;
GRANT EXECUTE ON FUNCTION trip_schema.is_trip_owner(uuid)
  TO authenticated, service_role, trip_service_role;
GRANT EXECUTE ON FUNCTION trip_schema.is_trip_editor(uuid)
  TO authenticated, service_role, trip_service_role;
GRANT EXECUTE ON FUNCTION trip_schema.is_trip_member(uuid)
  TO authenticated, service_role, trip_service_role;
GRANT EXECUTE ON FUNCTION trip_schema.is_trip_admin(uuid)
  TO authenticated, service_role, trip_service_role;

GRANT USAGE ON SCHEMA trip_schema TO authenticated;

GRANT SELECT, INSERT ON TABLE trip_schema.trips TO authenticated;
GRANT UPDATE (
  title,
  description,
  start_date,
  end_date,
  status,
  budget_amount,
  currency,
  version,
  deleted_at
) ON TABLE trip_schema.trips TO authenticated;

GRANT SELECT ON TABLE trip_schema.trip_members TO authenticated;
GRANT UPDATE (permission, status)
  ON TABLE trip_schema.trip_members TO authenticated;

GRANT SELECT, INSERT, DELETE ON TABLE trip_schema.trip_days TO authenticated;
GRANT UPDATE (date, day_index, status)
  ON TABLE trip_schema.trip_days TO authenticated;

GRANT SELECT, INSERT, DELETE ON TABLE trip_schema.trip_stops TO authenticated;
GRANT UPDATE (
  day_id,
  place_id,
  name,
  address,
  latitude,
  longitude,
  stop_index,
  arrival_time,
  departure_time,
  notes,
  status,
  version
) ON TABLE trip_schema.trip_stops TO authenticated;

GRANT SELECT, INSERT ON TABLE trip_schema.trip_invitations TO authenticated;
GRANT UPDATE (status, accepted_user_id, accepted_at)
  ON TABLE trip_schema.trip_invitations TO authenticated;

CREATE POLICY trip_select_member
  ON trip_schema.trips
  FOR SELECT
  TO authenticated
  USING (trip_schema.is_trip_member(id));

CREATE POLICY trip_insert_self_owned
  ON trip_schema.trips
  FOR INSERT
  TO authenticated
  WITH CHECK (
    owner_id = auth.uid()
    AND status = 'PLANNING'
    AND version = 1
    AND deleted_at IS NULL
  );

CREATE POLICY trip_update_owner
  ON trip_schema.trips
  FOR UPDATE
  TO authenticated
  USING (trip_schema.is_trip_owner(id))
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY trip_members_select_member
  ON trip_schema.trip_members
  FOR SELECT
  TO authenticated
  USING (trip_schema.is_trip_member(trip_id));

CREATE POLICY trip_members_update_owner
  ON trip_schema.trip_members
  FOR UPDATE
  TO authenticated
  USING (trip_schema.is_trip_owner(trip_id) AND role = 'MEMBER')
  WITH CHECK (
    trip_schema.is_trip_owner(trip_id)
    AND role = 'MEMBER'
  );

CREATE POLICY trip_members_leave_self
  ON trip_schema.trip_members
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    AND role = 'MEMBER'
    AND status = 'ACTIVE'
  )
  WITH CHECK (
    user_id = auth.uid()
    AND role = 'MEMBER'
    AND status = 'LEFT'
  );

CREATE POLICY trip_days_select_member
  ON trip_schema.trip_days
  FOR SELECT
  TO authenticated
  USING (status = 'ACTIVE' AND trip_schema.is_trip_member(trip_id));

CREATE POLICY trip_days_insert_editor
  ON trip_schema.trip_days
  FOR INSERT
  TO authenticated
  WITH CHECK (status = 'ACTIVE' AND trip_schema.is_trip_editor(trip_id));

CREATE POLICY trip_days_update_editor
  ON trip_schema.trip_days
  FOR UPDATE
  TO authenticated
  USING (status = 'ACTIVE' AND trip_schema.is_trip_editor(trip_id))
  WITH CHECK (trip_schema.is_trip_editor(trip_id));

CREATE POLICY trip_days_delete_editor
  ON trip_schema.trip_days
  FOR DELETE
  TO authenticated
  USING (trip_schema.is_trip_editor(trip_id));

CREATE POLICY trip_stops_select_member
  ON trip_schema.trip_stops
  FOR SELECT
  TO authenticated
  USING (status = 'ACTIVE' AND trip_schema.is_trip_member(trip_id));

CREATE POLICY trip_stops_insert_editor
  ON trip_schema.trip_stops
  FOR INSERT
  TO authenticated
  WITH CHECK (status = 'ACTIVE' AND trip_schema.is_trip_editor(trip_id));

CREATE POLICY trip_stops_update_editor
  ON trip_schema.trip_stops
  FOR UPDATE
  TO authenticated
  USING (status = 'ACTIVE' AND trip_schema.is_trip_editor(trip_id))
  WITH CHECK (trip_schema.is_trip_editor(trip_id));

CREATE POLICY trip_stops_delete_editor
  ON trip_schema.trip_stops
  FOR DELETE
  TO authenticated
  USING (trip_schema.is_trip_editor(trip_id));

CREATE POLICY trip_invitations_select_owner
  ON trip_schema.trip_invitations
  FOR SELECT
  TO authenticated
  USING (trip_schema.is_trip_owner(trip_id));

CREATE POLICY trip_invitations_select_invitee
  ON trip_schema.trip_invitations
  FOR SELECT
  TO authenticated
  USING (
    invitee_email = lower(COALESCE(auth.jwt() ->> 'email', ''))
    AND (
      (status = 'PENDING' AND expires_at > now())
      OR (status = 'ACCEPTED' AND accepted_user_id = auth.uid())
      OR status = 'DECLINED'
    )
  );

CREATE POLICY trip_invitations_insert_owner
  ON trip_schema.trip_invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    trip_schema.is_trip_owner(trip_id)
    AND inviter_id = auth.uid()
    AND status = 'PENDING'
    AND accepted_user_id IS NULL
    AND accepted_at IS NULL
  );

CREATE POLICY trip_invitations_update_owner
  ON trip_schema.trip_invitations
  FOR UPDATE
  TO authenticated
  USING (trip_schema.is_trip_owner(trip_id) AND status = 'PENDING')
  WITH CHECK (
    trip_schema.is_trip_owner(trip_id)
    AND status IN ('PENDING', 'REVOKED')
    AND accepted_user_id IS NULL
    AND accepted_at IS NULL
  );

CREATE POLICY trip_invitations_respond_invitee
  ON trip_schema.trip_invitations
  FOR UPDATE
  TO authenticated
  USING (
    invitee_email = lower(COALESCE(auth.jwt() ->> 'email', ''))
    AND status = 'PENDING'
    AND expires_at > now()
  )
  WITH CHECK (
    invitee_email = lower(COALESCE(auth.jwt() ->> 'email', ''))
    AND (
      (
        status = 'ACCEPTED'
        AND accepted_user_id = auth.uid()
        AND accepted_at IS NOT NULL
      )
      OR (
        status = 'DECLINED'
        AND accepted_user_id IS NULL
        AND accepted_at IS NULL
      )
    )
  );

COMMIT;
