BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;
SET search_path TO public, extensions;

SELECT plan(22);

SELECT has_table('trip_schema', 'trip_invitations', 'trip invitations table exists');
SELECT has_table('trip_schema', 'outbox_events', 'outbox events table exists');
SELECT has_table('notification_schema', 'processed_events', 'processed events table exists');
SELECT has_table(
  'notification_schema',
  'notification_deliveries',
  'notification deliveries table exists'
);

SELECT hasnt_column(
  'trip_schema',
  'trip_invitations',
  'token',
  'raw invitation token is never persisted'
);

SELECT ok(
  EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'trip_schema'
      AND tablename = 'outbox_events'
      AND policyname = 'trip_service_manage_outbox'
      AND roles = ARRAY['trip_service_role']::name[]
  ),
  'outbox RLS grants only the owning trip service role'
);

SELECT ok(
  EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'notification_schema'
      AND tablename = 'processed_events'
      AND policyname = 'notification_service_manage_processed_events'
      AND roles = ARRAY['notification_service_role']::name[]
  ),
  'processed-event RLS grants only the notification service role'
);

INSERT INTO trip_schema.trip_invitations (
  id,
  trip_id,
  inviter_id,
  invitee_email,
  permission,
  token_hash,
  expires_at
)
VALUES (
  '11111111-1111-4111-8111-111111111111',
  'b1b2c3d4-e5f6-4a5b-8c9d-0123456789ab',
  'a1b2c3d4-e5f6-4a5b-8c9d-0123456789ab',
  'guest@example.com',
  'VIEW',
  decode(repeat('ab', 32), 'hex'),
  now() + interval '7 days'
);

SELECT throws_ok(
  $$
    INSERT INTO trip_schema.trip_invitations (
      trip_id, inviter_id, invitee_email, permission, token_hash, expires_at
    ) VALUES (
      'b1b2c3d4-e5f6-4a5b-8c9d-0123456789ab',
      'a1b2c3d4-e5f6-4a5b-8c9d-0123456789ab',
      'Guest@Example.com', 'VIEW', decode(repeat('bc', 32), 'hex'),
      now() + interval '7 days'
    )
  $$,
  '23514',
  NULL,
  'invitation email must already be normalized'
);

SELECT throws_ok(
  $$
    INSERT INTO trip_schema.trip_invitations (
      trip_id, inviter_id, invitee_email, permission, token_hash, expires_at
    ) VALUES (
      'b1b2c3d4-e5f6-4a5b-8c9d-0123456789ab',
      'a1b2c3d4-e5f6-4a5b-8c9d-0123456789ab',
      'editor@example.com', 'EDIT', decode('abcd', 'hex'),
      now() + interval '7 days'
    )
  $$,
  '23514',
  NULL,
  'invitation token hash must be a SHA-256-sized value'
);

SELECT throws_ok(
  $$
    INSERT INTO trip_schema.trip_invitations (
      trip_id, inviter_id, invitee_email, permission, token_hash, expires_at
    ) VALUES (
      'b1b2c3d4-e5f6-4a5b-8c9d-0123456789ab',
      'a1b2c3d4-e5f6-4a5b-8c9d-0123456789ab',
      'guest@example.com', 'EDIT', decode(repeat('cd', 32), 'hex'),
      now() + interval '7 days'
    )
  $$,
  '23P01',
  NULL,
  'overlapping pending invitations are rejected per trip and email'
);

SELECT lives_ok(
  $$
    INSERT INTO trip_schema.trip_invitations (
      trip_id, inviter_id, invitee_email, permission, token_hash,
      created_at, expires_at
    ) VALUES (
      'b1b2c3d4-e5f6-4a5b-8c9d-0123456789ab',
      'a1b2c3d4-e5f6-4a5b-8c9d-0123456789ab',
      'guest@example.com', 'EDIT', decode(repeat('de', 32), 'hex'),
      now() + interval '8 days', now() + interval '15 days'
    )
  $$,
  'a new pending invitation is allowed after the previous period expires'
);

SELECT throws_ok(
  $$
    INSERT INTO trip_schema.outbox_events (
      aggregate_type, aggregate_id, event_type, payload, correlation_id
    ) VALUES (
      'TRIP', 'b1b2c3d4-e5f6-4a5b-8c9d-0123456789ab',
      'trip.created.v1', '[]'::jsonb, 'test-correlation'
    )
  $$,
  '23514',
  NULL,
  'outbox payload must be a JSON object'
);

SELECT throws_ok(
  $$
    INSERT INTO trip_schema.outbox_events (
      aggregate_type, aggregate_id, event_type, payload, correlation_id,
      publish_status
    ) VALUES (
      'TRIP', 'b1b2c3d4-e5f6-4a5b-8c9d-0123456789ab',
      'trip.created.v1', '{}'::jsonb, 'test-correlation', 'PUBLISHED'
    )
  $$,
  '23514',
  NULL,
  'published outbox events require published_at'
);

INSERT INTO notification_schema.processed_events (
  event_id,
  event_type,
  event_version
)
VALUES (
  '22222222-2222-4222-8222-222222222222',
  'trip.created.v1',
  1
);

SELECT throws_ok(
  $$
    INSERT INTO notification_schema.processed_events (
      event_id, event_type, event_version
    ) VALUES (
      '22222222-2222-4222-8222-222222222222', 'trip.created.v1', 1
    )
  $$,
  '23505',
  NULL,
  'processed event IDs are idempotent'
);

INSERT INTO notification_schema.notification_deliveries (
  event_id,
  channel,
  recipient
)
VALUES (
  '22222222-2222-4222-8222-222222222222',
  'EMAIL',
  'guest@example.com'
);

SELECT throws_ok(
  $$
    INSERT INTO notification_schema.notification_deliveries (
      event_id, channel, recipient
    ) VALUES (
      '22222222-2222-4222-8222-222222222222',
      'EMAIL', 'guest@example.com'
    )
  $$,
  '23505',
  NULL,
  'a delivery is unique per event channel and recipient'
);

SELECT throws_ok(
  $$
    UPDATE notification_schema.notification_deliveries
    SET delivery_status = 'SENT', delivered_at = NULL
    WHERE event_id = '22222222-2222-4222-8222-222222222222'
  $$,
  '23514',
  NULL,
  'sent delivery requires delivered_at'
);

SELECT ok(
  has_table_privilege(
    'trip_service_role',
    'trip_schema.trip_invitations',
    'SELECT, INSERT, UPDATE, DELETE'
  ),
  'trip service role owns invitation DML'
);

SELECT ok(
  has_table_privilege(
    'notification_service_role',
    'notification_schema.processed_events',
    'SELECT, INSERT, UPDATE, DELETE'
  ),
  'notification service role owns processed event DML'
);

SELECT ok(
  NOT has_table_privilege(
    'public',
    'notification_schema.notification_deliveries',
    'SELECT'
  ),
  'PUBLIC cannot read notification deliveries'
);

SELECT ok(
  EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'trip_schema'
      AND indexname = 'outbox_events_polling_idx'
      AND indexdef LIKE '%next_attempt_at%'
  ),
  'outbox has a polling index'
);

SELECT ok(
  EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'notification_schema'
      AND indexname = 'notification_deliveries_retry_idx'
      AND indexdef LIKE '%next_attempt_at%'
  ),
  'notification deliveries have a retry index'
);

UPDATE notification_schema.notification_deliveries
SET updated_at = '2000-01-01 00:00:00+00'
WHERE event_id = '22222222-2222-4222-8222-222222222222';

SELECT ok(
  (
    SELECT updated_at > '2000-01-01 00:00:00+00'
    FROM notification_schema.notification_deliveries
    WHERE event_id = '22222222-2222-4222-8222-222222222222'
  ),
  'notification updated_at trigger overrides stale client timestamps'
);

SELECT * FROM finish();

ROLLBACK;
