BEGIN;

CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA extensions;

CREATE TABLE trip_schema.trip_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES trip_schema.trips(id),
  inviter_id uuid NOT NULL,
  invitee_email text NOT NULL,
  permission text NOT NULL,
  token_hash bytea NOT NULL,
  status text NOT NULL DEFAULT 'PENDING',
  expires_at timestamptz NOT NULL,
  accepted_user_id uuid,
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT trip_invitations_email_check CHECK (
    invitee_email = lower(btrim(invitee_email))
    AND invitee_email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ),
  CONSTRAINT trip_invitations_permission_check
    CHECK (permission IN ('VIEW', 'EDIT')),
  CONSTRAINT trip_invitations_token_hash_check
    CHECK (octet_length(token_hash) = 32),
  CONSTRAINT trip_invitations_status_check
    CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'REVOKED')),
  CONSTRAINT trip_invitations_expiry_check CHECK (expires_at > created_at),
  CONSTRAINT trip_invitations_acceptance_check CHECK (
    (status = 'ACCEPTED' AND accepted_user_id IS NOT NULL AND accepted_at IS NOT NULL)
    OR (status <> 'ACCEPTED' AND accepted_user_id IS NULL AND accepted_at IS NULL)
  ),
  CONSTRAINT trip_invitations_token_hash_key UNIQUE (token_hash),
  CONSTRAINT trip_invitations_pending_period_excl EXCLUDE USING gist (
    trip_id WITH =,
    invitee_email WITH =,
    tstzrange(created_at, expires_at, '[)') WITH &&
  ) WHERE (status = 'PENDING')
);

CREATE INDEX trip_invitations_trip_status_idx
  ON trip_schema.trip_invitations (trip_id, status, created_at DESC);
CREATE INDEX trip_invitations_invitee_status_idx
  ON trip_schema.trip_invitations (invitee_email, status, expires_at);
CREATE INDEX trip_invitations_pending_expiry_idx
  ON trip_schema.trip_invitations (expires_at)
  WHERE status = 'PENDING';

CREATE TABLE trip_schema.outbox_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_type text NOT NULL,
  aggregate_id uuid NOT NULL,
  event_type text NOT NULL,
  event_version integer NOT NULL DEFAULT 1,
  payload jsonb NOT NULL,
  correlation_id text NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  publish_status text NOT NULL DEFAULT 'PENDING',
  attempts integer NOT NULL DEFAULT 0,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT outbox_events_aggregate_type_check
    CHECK (btrim(aggregate_type) <> ''),
  CONSTRAINT outbox_events_event_type_check CHECK (btrim(event_type) <> ''),
  CONSTRAINT outbox_events_event_version_check CHECK (event_version >= 1),
  CONSTRAINT outbox_events_payload_check CHECK (jsonb_typeof(payload) = 'object'),
  CONSTRAINT outbox_events_correlation_id_check
    CHECK (btrim(correlation_id) <> '' AND char_length(correlation_id) <= 128),
  CONSTRAINT outbox_events_publish_status_check
    CHECK (publish_status IN ('PENDING', 'PUBLISHED', 'FAILED')),
  CONSTRAINT outbox_events_attempts_check CHECK (attempts >= 0),
  CONSTRAINT outbox_events_published_at_check CHECK (
    (publish_status = 'PUBLISHED') = (published_at IS NOT NULL)
  )
);

CREATE INDEX outbox_events_polling_idx
  ON trip_schema.outbox_events (next_attempt_at, occurred_at, id)
  WHERE publish_status IN ('PENDING', 'FAILED');
CREATE INDEX outbox_events_aggregate_idx
  ON trip_schema.outbox_events (aggregate_type, aggregate_id, occurred_at);

CREATE TABLE notification_schema.processed_events (
  event_id uuid PRIMARY KEY,
  event_type text NOT NULL,
  event_version integer NOT NULL,
  consumer_name text NOT NULL DEFAULT 'notification-worker',
  processed_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT processed_events_event_type_check CHECK (btrim(event_type) <> ''),
  CONSTRAINT processed_events_event_version_check CHECK (event_version >= 1),
  CONSTRAINT processed_events_consumer_name_check CHECK (btrim(consumer_name) <> '')
);

CREATE TABLE notification_schema.notification_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL
    REFERENCES notification_schema.processed_events(event_id),
  channel text NOT NULL,
  recipient text NOT NULL,
  delivery_status text NOT NULL DEFAULT 'PENDING',
  attempts integer NOT NULL DEFAULT 0,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  delivered_at timestamptz,
  last_error_code text,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT notification_deliveries_channel_check
    CHECK (channel IN ('EMAIL', 'PUSH')),
  CONSTRAINT notification_deliveries_recipient_check CHECK (btrim(recipient) <> ''),
  CONSTRAINT notification_deliveries_status_check
    CHECK (delivery_status IN ('PENDING', 'SENDING', 'SENT', 'FAILED', 'SKIPPED')),
  CONSTRAINT notification_deliveries_attempts_check CHECK (attempts >= 0),
  CONSTRAINT notification_deliveries_delivered_at_check CHECK (
    (delivery_status = 'SENT' AND delivered_at IS NOT NULL)
    OR (delivery_status <> 'SENT' AND delivered_at IS NULL)
  ),
  CONSTRAINT notification_deliveries_event_channel_recipient_key
    UNIQUE (event_id, channel, recipient)
);

CREATE INDEX notification_deliveries_retry_idx
  ON notification_schema.notification_deliveries (next_attempt_at, created_at, id)
  WHERE delivery_status IN ('PENDING', 'FAILED');
CREATE INDEX notification_deliveries_event_idx
  ON notification_schema.notification_deliveries (event_id);

CREATE FUNCTION notification_schema.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trip_invitations_set_updated_at
  BEFORE UPDATE ON trip_schema.trip_invitations
  FOR EACH ROW EXECUTE FUNCTION trip_schema.set_updated_at();
CREATE TRIGGER outbox_events_set_updated_at
  BEFORE UPDATE ON trip_schema.outbox_events
  FOR EACH ROW EXECUTE FUNCTION trip_schema.set_updated_at();
CREATE TRIGGER notification_deliveries_set_updated_at
  BEFORE UPDATE ON notification_schema.notification_deliveries
  FOR EACH ROW EXECUTE FUNCTION notification_schema.set_updated_at();

ALTER TABLE trip_schema.trip_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_schema.outbox_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_schema.processed_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_schema.notification_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY trip_service_manage_invitations
  ON trip_schema.trip_invitations
  FOR ALL
  TO trip_service_role
  USING (true)
  WITH CHECK (true);
CREATE POLICY trip_service_manage_outbox
  ON trip_schema.outbox_events
  FOR ALL
  TO trip_service_role
  USING (true)
  WITH CHECK (true);
CREATE POLICY notification_service_manage_processed_events
  ON notification_schema.processed_events
  FOR ALL
  TO notification_service_role
  USING (true)
  WITH CHECK (true);
CREATE POLICY notification_service_manage_deliveries
  ON notification_schema.notification_deliveries
  FOR ALL
  TO notification_service_role
  USING (true)
  WITH CHECK (true);

ALTER TABLE trip_schema.trip_invitations OWNER TO postgres;
ALTER TABLE trip_schema.outbox_events OWNER TO postgres;
ALTER TABLE notification_schema.processed_events OWNER TO postgres;
ALTER TABLE notification_schema.notification_deliveries OWNER TO postgres;
ALTER FUNCTION notification_schema.set_updated_at() OWNER TO postgres;

REVOKE ALL ON TABLE trip_schema.trip_invitations FROM PUBLIC;
REVOKE ALL ON TABLE trip_schema.outbox_events FROM PUBLIC;
REVOKE ALL ON TABLE notification_schema.processed_events FROM PUBLIC;
REVOKE ALL ON TABLE notification_schema.notification_deliveries FROM PUBLIC;
REVOKE ALL ON FUNCTION notification_schema.set_updated_at() FROM PUBLIC;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE trip_schema.trip_invitations, trip_schema.outbox_events
  TO trip_service_role;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE notification_schema.processed_events,
    notification_schema.notification_deliveries
  TO notification_service_role;
GRANT EXECUTE ON FUNCTION notification_schema.set_updated_at()
  TO notification_service_role;

COMMIT;
