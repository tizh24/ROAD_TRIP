BEGIN;

CREATE SCHEMA IF NOT EXISTS notification_schema AUTHORIZATION postgres;

DO $$
DECLARE
  role_name name;
BEGIN
  FOREACH role_name IN ARRAY ARRAY[
    'trip_service_role',
    'social_service_role',
    'monetization_service_role',
    'geo_service_role',
    'notification_service_role'
  ]::name[]
  LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = role_name) THEN
      EXECUTE format(
        'CREATE ROLE %I WITH NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS',
        role_name
      );
    ELSE
      -- Supabase migrations do not run as a superuser, so only normalize
      -- attributes that do not require superuser privileges. Roles created by
      -- PostgreSQL already default to the remaining least-privilege flags.
      EXECUTE format('ALTER ROLE %I WITH NOLOGIN NOINHERIT', role_name);
    END IF;
  END LOOP;
END
$$;

ALTER SCHEMA trip_schema OWNER TO postgres;
ALTER SCHEMA social_schema OWNER TO postgres;
ALTER SCHEMA monetization_schema OWNER TO postgres;
ALTER SCHEMA geo_schema OWNER TO postgres;
ALTER SCHEMA notification_schema OWNER TO postgres;

REVOKE ALL ON SCHEMA trip_schema FROM PUBLIC;
REVOKE ALL ON SCHEMA social_schema FROM PUBLIC;
REVOKE ALL ON SCHEMA monetization_schema FROM PUBLIC;
REVOKE ALL ON SCHEMA geo_schema FROM PUBLIC;
REVOKE ALL ON SCHEMA notification_schema FROM PUBLIC;

GRANT USAGE ON SCHEMA trip_schema TO trip_service_role;
GRANT USAGE ON SCHEMA social_schema TO social_service_role;
GRANT USAGE ON SCHEMA monetization_schema TO monetization_service_role;
GRANT USAGE ON SCHEMA geo_schema TO geo_service_role;
GRANT USAGE ON SCHEMA notification_schema TO notification_service_role;

REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA trip_schema FROM PUBLIC, trip_service_role;
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA social_schema FROM PUBLIC, social_service_role;
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA monetization_schema FROM PUBLIC, monetization_service_role;
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA geo_schema FROM PUBLIC, geo_service_role;
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA notification_schema FROM PUBLIC, notification_service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA trip_schema TO trip_service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA social_schema TO social_service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA monetization_schema TO monetization_service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA geo_schema TO geo_service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA notification_schema TO notification_service_role;

REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA trip_schema FROM PUBLIC, trip_service_role;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA social_schema FROM PUBLIC, social_service_role;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA monetization_schema FROM PUBLIC, monetization_service_role;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA geo_schema FROM PUBLIC, geo_service_role;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA notification_schema FROM PUBLIC, notification_service_role;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA trip_schema TO trip_service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA social_schema TO social_service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA monetization_schema TO monetization_service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA geo_schema TO geo_service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA notification_schema TO notification_service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA trip_schema
  REVOKE ALL ON TABLES FROM PUBLIC, trip_service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA trip_schema
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO trip_service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA trip_schema
  REVOKE ALL ON SEQUENCES FROM PUBLIC, trip_service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA trip_schema
  GRANT USAGE, SELECT ON SEQUENCES TO trip_service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA trip_schema
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA trip_schema
  GRANT EXECUTE ON FUNCTIONS TO trip_service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA social_schema
  REVOKE ALL ON TABLES FROM PUBLIC, social_service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA social_schema
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO social_service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA social_schema
  REVOKE ALL ON SEQUENCES FROM PUBLIC, social_service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA social_schema
  GRANT USAGE, SELECT ON SEQUENCES TO social_service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA social_schema
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA social_schema
  GRANT EXECUTE ON FUNCTIONS TO social_service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA monetization_schema
  REVOKE ALL ON TABLES FROM PUBLIC, monetization_service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA monetization_schema
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO monetization_service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA monetization_schema
  REVOKE ALL ON SEQUENCES FROM PUBLIC, monetization_service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA monetization_schema
  GRANT USAGE, SELECT ON SEQUENCES TO monetization_service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA monetization_schema
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA monetization_schema
  GRANT EXECUTE ON FUNCTIONS TO monetization_service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA geo_schema
  REVOKE ALL ON TABLES FROM PUBLIC, geo_service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA geo_schema
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO geo_service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA geo_schema
  REVOKE ALL ON SEQUENCES FROM PUBLIC, geo_service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA geo_schema
  GRANT USAGE, SELECT ON SEQUENCES TO geo_service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA geo_schema
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA geo_schema
  GRANT EXECUTE ON FUNCTIONS TO geo_service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA notification_schema
  REVOKE ALL ON TABLES FROM PUBLIC, notification_service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA notification_schema
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO notification_service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA notification_schema
  REVOKE ALL ON SEQUENCES FROM PUBLIC, notification_service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA notification_schema
  GRANT USAGE, SELECT ON SEQUENCES TO notification_service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA notification_schema
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA notification_schema
  GRANT EXECUTE ON FUNCTIONS TO notification_service_role;

ALTER FUNCTION public.handle_new_user() SET search_path TO '';
ALTER FUNCTION trip_schema.is_trip_owner(uuid) SET search_path TO '';
ALTER FUNCTION trip_schema.is_trip_admin(uuid) SET search_path TO '';
ALTER FUNCTION trip_schema.is_trip_member(uuid) SET search_path TO '';

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION trip_schema.is_trip_owner(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION trip_schema.is_trip_admin(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION trip_schema.is_trip_member(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION trip_schema.is_trip_owner(uuid)
  TO authenticated, service_role, trip_service_role;
GRANT EXECUTE ON FUNCTION trip_schema.is_trip_admin(uuid)
  TO authenticated, service_role, trip_service_role;
GRANT EXECUTE ON FUNCTION trip_schema.is_trip_member(uuid)
  TO authenticated, service_role, trip_service_role;

COMMIT;
