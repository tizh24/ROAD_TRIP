BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;
SET search_path TO public, extensions;

SELECT plan(27);

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token
)
VALUES
(
  '00000000-0000-0000-0000-000000000000',
  'e1e2c3d4-e5f6-4a5b-8c9d-0123456789ab',
  'authenticated', 'authenticated', 'editor@example.com',
  crypt('password123', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Editor User"}', now(), now(), '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000',
  'f1f2c3d4-e5f6-4a5b-8c9d-0123456789ab',
  'authenticated', 'authenticated', 'viewer@example.com',
  crypt('password123', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Viewer User"}', now(), now(), '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000',
  '91929394-e5f6-4a5b-8c9d-0123456789ab',
  'authenticated', 'authenticated', 'outsider@example.com',
  crypt('password123', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Outsider User"}', now(), now(), '', '', '', ''
);

INSERT INTO trip_schema.trip_members (
  trip_id,
  user_id,
  role,
  permission
)
VALUES
(
  'b1b2c3d4-e5f6-4a5b-8c9d-0123456789ab',
  'e1e2c3d4-e5f6-4a5b-8c9d-0123456789ab',
  'MEMBER',
  'EDIT'
),
(
  'b1b2c3d4-e5f6-4a5b-8c9d-0123456789ab',
  'f1f2c3d4-e5f6-4a5b-8c9d-0123456789ab',
  'MEMBER',
  'VIEW'
);

INSERT INTO trip_schema.trip_invitations (
  id,
  trip_id,
  inviter_id,
  invitee_email,
  permission,
  token_hash,
  created_at,
  expires_at
)
VALUES
(
  '41414141-4141-4141-8141-414141414141',
  'b1b2c3d4-e5f6-4a5b-8c9d-0123456789ab',
  'a1b2c3d4-e5f6-4a5b-8c9d-0123456789ab',
  'outsider@example.com',
  'VIEW',
  decode(repeat('41', 32), 'hex'),
  now(),
  now() + interval '7 days'
),
(
  '42424242-4242-4242-8242-424242424242',
  'b1b2c3d4-e5f6-4a5b-8c9d-0123456789ab',
  'a1b2c3d4-e5f6-4a5b-8c9d-0123456789ab',
  'viewer@example.com',
  'VIEW',
  decode(repeat('42', 32), 'hex'),
  now() - interval '2 days',
  now() - interval '1 day'
);

SELECT has_function(
  'trip_schema',
  'trip_access_level',
  ARRAY['uuid'],
  'non-recursive trip access helper exists'
);

SELECT ok(
  NOT has_function_privilege(
    'public',
    'trip_schema.trip_access_level(uuid)',
    'EXECUTE'
  ),
  'PUBLIC cannot execute the access helper'
);

SELECT set_config(
  'request.jwt.claim.sub',
  'a1b2c3d4-e5f6-4a5b-8c9d-0123456789ab',
  true
);
SELECT set_config(
  'request.jwt.claims',
  '{"sub":"a1b2c3d4-e5f6-4a5b-8c9d-0123456789ab","email":"admin@roadtrip.com","role":"authenticated"}',
  true
);
SET LOCAL ROLE authenticated;

SELECT is(
  (SELECT count(*) FROM trip_schema.trips),
  1::bigint,
  'owner can read the trip'
);

SELECT results_eq(
  $$
    UPDATE trip_schema.trips
    SET title = 'Owner updated title'
    WHERE id = 'b1b2c3d4-e5f6-4a5b-8c9d-0123456789ab'
    RETURNING title
  $$,
  ARRAY['Owner updated title'::text],
  'owner can update trip details'
);

SELECT is(
  (SELECT count(*) FROM trip_schema.trip_members),
  3::bigint,
  'owner can read all trip members'
);

SELECT is(
  (SELECT count(*) FROM trip_schema.trip_invitations),
  2::bigint,
  'owner can read all trip invitations'
);

SELECT lives_ok(
  $$
    UPDATE trip_schema.trip_members
    SET permission = 'VIEW'
    WHERE user_id = 'e1e2c3d4-e5f6-4a5b-8c9d-0123456789ab';
    UPDATE trip_schema.trip_members
    SET permission = 'EDIT'
    WHERE user_id = 'e1e2c3d4-e5f6-4a5b-8c9d-0123456789ab'
  $$,
  'owner can manage member permissions'
);

SELECT results_eq(
  $$
    UPDATE trip_schema.trip_members
    SET status = 'LEFT'
    WHERE user_id = 'a1b2c3d4-e5f6-4a5b-8c9d-0123456789ab'
    RETURNING id
  $$,
  ARRAY[]::uuid[],
  'owner membership cannot be deactivated through member management'
);

RESET ROLE;
SELECT set_config(
  'request.jwt.claim.sub',
  'e1e2c3d4-e5f6-4a5b-8c9d-0123456789ab',
  true
);
SELECT set_config(
  'request.jwt.claims',
  '{"sub":"e1e2c3d4-e5f6-4a5b-8c9d-0123456789ab","email":"editor@example.com","role":"authenticated"}',
  true
);
SET LOCAL ROLE authenticated;

SELECT is(
  (SELECT count(*) FROM trip_schema.trips),
  1::bigint,
  'editor can read the trip'
);

SELECT results_eq(
  $$
    UPDATE trip_schema.trip_stops
    SET notes = 'Edited through RLS'
    WHERE place_id = 'place_1'
    RETURNING notes
  $$,
  ARRAY['Edited through RLS'::text],
  'editor can update itinerary stops'
);

SELECT results_eq(
  $$
    INSERT INTO trip_schema.trip_stops (
      trip_id, day_id, place_id, name, latitude, longitude, stop_index
    ) VALUES (
      'b1b2c3d4-e5f6-4a5b-8c9d-0123456789ab',
      'd1b2c3d4-e5f6-4a5b-8c9d-0123456789ab',
      'editor-place', 'Editor stop', 11.95, 108.45, 3
    )
    RETURNING place_id
  $$,
  ARRAY['editor-place'::text],
  'editor can add itinerary stops'
);

SELECT results_eq(
  $$
    UPDATE trip_schema.trips
    SET title = 'Editor must not update this'
    WHERE id = 'b1b2c3d4-e5f6-4a5b-8c9d-0123456789ab'
    RETURNING id
  $$,
  ARRAY[]::uuid[],
  'editor cannot update trip details'
);

SELECT is(
  (SELECT count(*) FROM trip_schema.trip_members),
  3::bigint,
  'editor can read trip members'
);

SELECT throws_ok(
  $$
    INSERT INTO trip_schema.trip_invitations (
      trip_id, inviter_id, invitee_email, permission, token_hash, expires_at
    ) VALUES (
      'b1b2c3d4-e5f6-4a5b-8c9d-0123456789ab',
      'e1e2c3d4-e5f6-4a5b-8c9d-0123456789ab',
      'blocked@example.com', 'VIEW', decode(repeat('43', 32), 'hex'),
      now() + interval '7 days'
    )
  $$,
  '42501',
  NULL,
  'editor cannot create invitations'
);

RESET ROLE;
SELECT set_config(
  'request.jwt.claim.sub',
  'f1f2c3d4-e5f6-4a5b-8c9d-0123456789ab',
  true
);
SELECT set_config(
  'request.jwt.claims',
  '{"sub":"f1f2c3d4-e5f6-4a5b-8c9d-0123456789ab","email":"viewer@example.com","role":"authenticated"}',
  true
);
SET LOCAL ROLE authenticated;

SELECT is(
  (SELECT count(*) FROM trip_schema.trips),
  1::bigint,
  'viewer can read the trip'
);

SELECT is(
  (SELECT count(*) FROM trip_schema.trip_stops),
  3::bigint,
  'viewer can read itinerary stops'
);

SELECT results_eq(
  $$
    UPDATE trip_schema.trip_stops
    SET notes = 'Viewer mutation'
    WHERE place_id = 'place_1'
    RETURNING id
  $$,
  ARRAY[]::uuid[],
  'viewer cannot update stops'
);

SELECT results_eq(
  $$
    DELETE FROM trip_schema.trip_stops
    WHERE place_id = 'place_1'
    RETURNING id
  $$,
  ARRAY[]::uuid[],
  'viewer cannot delete stops'
);

SELECT throws_ok(
  $$
    UPDATE trip_schema.trip_members
    SET permission = 'EDIT'
    WHERE user_id = 'f1f2c3d4-e5f6-4a5b-8c9d-0123456789ab'
  $$,
  '42501',
  NULL,
  'viewer cannot escalate their permission'
);

SELECT is(
  (SELECT count(*) FROM trip_schema.trip_invitations),
  0::bigint,
  'expired invitation is not visible to invitee'
);

SELECT results_eq(
  $$
    UPDATE trip_schema.trip_members
    SET status = 'LEFT'
    WHERE user_id = 'f1f2c3d4-e5f6-4a5b-8c9d-0123456789ab'
    RETURNING status
  $$,
  ARRAY['LEFT'::text],
  'member can leave without mutating identity or role'
);

RESET ROLE;
SELECT set_config(
  'request.jwt.claim.sub',
  '91929394-e5f6-4a5b-8c9d-0123456789ab',
  true
);
SELECT set_config(
  'request.jwt.claims',
  '{"sub":"91929394-e5f6-4a5b-8c9d-0123456789ab","email":"outsider@example.com","role":"authenticated"}',
  true
);
SET LOCAL ROLE authenticated;

SELECT is(
  (SELECT count(*) FROM trip_schema.trips),
  0::bigint,
  'outsider cannot read trips'
);

SELECT is(
  (SELECT count(*) FROM trip_schema.trip_members),
  0::bigint,
  'outsider cannot read members'
);

SELECT is(
  (SELECT count(*) FROM trip_schema.trip_invitations),
  1::bigint,
  'matching invitee can read their active invitation'
);

SELECT results_eq(
  $$
    UPDATE trip_schema.trip_invitations
    SET
      status = 'ACCEPTED',
      accepted_user_id = '91929394-e5f6-4a5b-8c9d-0123456789ab',
      accepted_at = now()
    WHERE id = '41414141-4141-4141-8141-414141414141'
    RETURNING status
  $$,
  ARRAY['ACCEPTED'::text],
  'matching invitee can accept for their own identity'
);

RESET ROLE;

SELECT ok(
  EXISTS (
    SELECT 1
    FROM trip_schema.trip_invitations
    WHERE id = '41414141-4141-4141-8141-414141414141'
      AND status = 'ACCEPTED'
      AND accepted_user_id = '91929394-e5f6-4a5b-8c9d-0123456789ab'
      AND accepted_at IS NOT NULL
  ),
  'accepted invitation persists the matching identity'
);

SELECT ok(
  NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'trip_schema'
      AND policyname IN (
        'Members can manage active days',
        'Members can manage active stops',
        'Admins can update members'
      )
  ),
  'legacy permissive and ADMIN policies are removed'
);

SELECT * FROM finish();

ROLLBACK;
