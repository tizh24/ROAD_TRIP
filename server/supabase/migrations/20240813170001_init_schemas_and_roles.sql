-- Create custom schemas
CREATE SCHEMA IF NOT EXISTS trip_schema;
CREATE SCHEMA IF NOT EXISTS social_schema;
CREATE SCHEMA IF NOT EXISTS monetization_schema;
CREATE SCHEMA IF NOT EXISTS geo_schema;

-- Create service roles
-- Note: 'postgres' and 'supabase_admin' are default superusers in Supabase
-- We create explicit roles for microservices
CREATE ROLE trip_service_role NOLOGIN;
CREATE ROLE social_service_role NOLOGIN;
CREATE ROLE monetization_service_role NOLOGIN;
CREATE ROLE geo_service_role NOLOGIN;

-- Grant USAGE on schemas
GRANT USAGE ON SCHEMA trip_schema TO trip_service_role;
GRANT USAGE ON SCHEMA social_schema TO social_service_role;
GRANT USAGE ON SCHEMA monetization_schema TO monetization_service_role;
GRANT USAGE ON SCHEMA geo_schema TO geo_service_role;

-- Grant access to existing and future tables in their respective schemas
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA trip_schema GRANT ALL ON TABLES TO trip_service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA social_schema GRANT ALL ON TABLES TO social_service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA monetization_schema GRANT ALL ON TABLES TO monetization_service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA geo_schema GRANT ALL ON TABLES TO geo_service_role;
