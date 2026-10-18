-- Migration: 20261018060000_add_slice_6_billing_and_travel_books.sql
-- Description: Orders, payment receipts, signed webhook tracking, and travel book fulfillment

CREATE SCHEMA IF NOT EXISTS billing_schema;

CREATE TABLE IF NOT EXISTS billing_schema.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trip_id uuid REFERENCES trip_schema.trips(id) ON DELETE SET NULL,
  item_type text NOT NULL CHECK (item_type IN ('TRAVEL_BOOK', 'PARTNER_SERVICE', 'SUBSCRIPTION', 'OTHER')),
  item_id text NOT NULL,
  title text NOT NULL,
  amount numeric(12, 2) NOT NULL,
  currency text NOT NULL DEFAULT 'VND',
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED')),
  payment_method text CHECK (payment_method IN ('VIETQR', 'MOMO', 'CREDIT_CARD', 'BANK_TRANSFER')),
  payment_ref text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS billing_schema.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES billing_schema.orders(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'MOCK_PROVIDER',
  transaction_id text NOT NULL UNIQUE,
  amount numeric(12, 2) NOT NULL,
  currency text NOT NULL DEFAULT 'VND',
  status text NOT NULL CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED')),
  signature text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  processed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS billing_schema.travel_books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES trip_schema.trips(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  subtitle text,
  format text NOT NULL DEFAULT 'HARDCOVER' CHECK (format IN ('DIGITAL_PDF', 'SOFTCOVER', 'HARDCOVER')),
  page_count integer NOT NULL DEFAULT 24,
  cover_photo_url text,
  shipping_address jsonb,
  status text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ORDERED', 'PRINTING', 'SHIPPED', 'DELIVERED')),
  order_id uuid REFERENCES billing_schema.orders(id) ON DELETE SET NULL,
  preview_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_travel_book_trip UNIQUE (trip_id)
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON billing_schema.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON billing_schema.orders(status);
CREATE INDEX IF NOT EXISTS idx_payments_order ON billing_schema.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction ON billing_schema.payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_travel_books_trip ON billing_schema.travel_books(trip_id);
CREATE INDEX IF NOT EXISTS idx_travel_books_user ON billing_schema.travel_books(user_id);
