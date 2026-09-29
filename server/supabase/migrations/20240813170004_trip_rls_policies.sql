-- Helper function to check if current user is owner of the trip
CREATE OR REPLACE FUNCTION trip_schema.is_trip_owner(trip_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM trip_schema.trips
    WHERE id = trip_id AND owner_id = auth.uid() AND status != 'DELETED'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if current user is at least an admin of the trip
CREATE OR REPLACE FUNCTION trip_schema.is_trip_admin(target_trip_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM trip_schema.trip_members
    WHERE trip_id = target_trip_id
      AND user_id = auth.uid()
      AND role IN ('OWNER', 'ADMIN')
      AND status = 'ACTIVE'
  ) OR trip_schema.is_trip_owner(target_trip_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if current user is an active member of the trip (any role)
CREATE OR REPLACE FUNCTION trip_schema.is_trip_member(target_trip_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM trip_schema.trip_members
    WHERE trip_id = target_trip_id
      AND user_id = auth.uid()
      AND status = 'ACTIVE'
  ) OR trip_schema.is_trip_owner(target_trip_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-------------------------------------------------------------------------------
-- 1. Policies for trips table
-------------------------------------------------------------------------------
-- View: Members and owner can view non-deleted trips
CREATE POLICY "Users can view active trips they own or joined"
    ON trip_schema.trips FOR SELECT
    USING (status != 'DELETED' AND (owner_id = auth.uid() OR trip_schema.is_trip_member(id)));

-- Insert: Any authenticated user can create a trip
CREATE POLICY "Authenticated users can create trips"
    ON trip_schema.trips FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Update: Only owner or admin can update trip details (Soft delete handled via update status = 'DELETED')
CREATE POLICY "Admins and Owners can update trip details"
    ON trip_schema.trips FOR UPDATE
    USING (trip_schema.is_trip_admin(id) AND status != 'DELETED');

-- Hard Delete is disabled (no FOR DELETE policy)

-------------------------------------------------------------------------------
-- 2. Policies for trip_members table
-------------------------------------------------------------------------------
-- View: Active members can see other active members in the same trip
CREATE POLICY "Active members can view trip members"
    ON trip_schema.trip_members FOR SELECT
    USING (status = 'ACTIVE' AND trip_schema.is_trip_member(trip_id));

-- Insert/Update: Only owner or admins can add/edit members
CREATE POLICY "Admins can add members"
    ON trip_schema.trip_members FOR INSERT
    WITH CHECK (trip_schema.is_trip_admin(trip_id));

CREATE POLICY "Admins can update members"
    ON trip_schema.trip_members FOR UPDATE
    USING (trip_schema.is_trip_admin(trip_id));

-- Member leave (Soft delete via update)
CREATE POLICY "Users can leave trip (Soft delete)"
    ON trip_schema.trip_members FOR UPDATE
    USING (user_id = auth.uid() AND status = 'ACTIVE')
    WITH CHECK (status = 'LEFT');

-- Hard Delete is disabled

-------------------------------------------------------------------------------
-- 3. Policies for trip_days and trip_stops tables
-------------------------------------------------------------------------------
-- View: All members can view active days and stops
CREATE POLICY "Members can view active days"
    ON trip_schema.trip_days FOR SELECT
    USING (status = 'ACTIVE' AND trip_schema.is_trip_member(trip_id));

CREATE POLICY "Members can view active stops"
    ON trip_schema.trip_stops FOR SELECT
    USING (status = 'ACTIVE' AND trip_schema.is_trip_member(trip_id));

-- Insert/Update: Any member can collaboratively manage active itinerary
CREATE POLICY "Members can manage active days"
    ON trip_schema.trip_days FOR ALL
    USING (status = 'ACTIVE' AND trip_schema.is_trip_member(trip_id));

CREATE POLICY "Members can manage active stops"
    ON trip_schema.trip_stops FOR ALL
    USING (status = 'ACTIVE' AND trip_schema.is_trip_member(trip_id));

-- Note: We still allow FOR ALL (including DELETE) for days and stops,
-- because deleting a stop from an itinerary is a normal operation and doesn't destroy the whole trip.
-- However, status='DELETED' is preferred for audit trails.
