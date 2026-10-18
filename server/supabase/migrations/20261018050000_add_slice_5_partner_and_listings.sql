-- Migration: 20261018050000_add_slice_5_partner_and_listings.sql
-- Description: Partner applications, partner commercial listings, and admin capability verification

CREATE SCHEMA IF NOT EXISTS partner_schema;

CREATE TABLE IF NOT EXISTS partner_schema.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  business_type text NOT NULL CHECK (business_type IN ('HOTEL', 'HOMESTAY', 'RESTAURANT', 'TOUR_OPERATOR', 'TRANSPORT', 'OTHER')),
  contact_email text NOT NULL,
  contact_phone text NOT NULL,
  tax_id text,
  description text,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED')),
  review_notes text,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_partner_application_user UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS partner_schema.listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('STAY', 'FOOD', 'EXPERIENCE', 'TRANSPORT', 'EQUIPMENT')),
  location_name text NOT NULL,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  price_amount numeric(12, 2) NOT NULL,
  price_currency text NOT NULL DEFAULT 'VND',
  media_urls text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_partner_applications_user ON partner_schema.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_applications_status ON partner_schema.applications(status);
CREATE INDEX IF NOT EXISTS idx_partner_listings_partner ON partner_schema.listings(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_listings_status ON partner_schema.listings(status);
