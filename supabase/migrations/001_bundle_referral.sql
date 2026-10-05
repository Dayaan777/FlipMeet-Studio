-- =============================================================
-- Migration: 001_bundle_referral
-- Adds referral_codes table columns, orders discount columns,
-- order_items bundle_sizes column, and email column alias.
-- Run once in Supabase SQL Editor (idempotent — uses IF NOT EXISTS).
-- =============================================================

-- ---------------------------------------------------------------
-- referral_codes table
-- (Create the table first if it doesn't yet exist so the ALTERs
--  below are always safe to run.)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code        text NOT NULL UNIQUE,
  created_at  timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.referral_codes ADD COLUMN IF NOT EXISTS discount_percent numeric(5,2)  DEFAULT 0;
ALTER TABLE public.referral_codes ADD COLUMN IF NOT EXISTS categories      text[]         DEFAULT ARRAY['All categories'];
ALTER TABLE public.referral_codes ADD COLUMN IF NOT EXISTS is_active       boolean        DEFAULT true;

-- ---------------------------------------------------------------
-- orders table additions
-- ---------------------------------------------------------------
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS email            text           DEFAULT NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS phone            text           DEFAULT NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS referral_code    text           DEFAULT NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_amount  numeric(10,2)  DEFAULT NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS per_item_discounts jsonb         DEFAULT NULL;

-- ---------------------------------------------------------------
-- order_items table
-- (Create if it doesn't exist; existing rows are unaffected.)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
  id                 text PRIMARY KEY,
  order_id           text NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id         text NOT NULL,
  quantity           integer NOT NULL DEFAULT 1,
  price_at_purchase  numeric(10,2) NOT NULL DEFAULT 0,
  size               text NOT NULL DEFAULT 'M',
  created_at         timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS bundle_sizes jsonb DEFAULT NULL;

-- ---------------------------------------------------------------
-- RLS: referral_codes — service role only
-- ---------------------------------------------------------------
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

-- Drop any previously open anonymous read policy
DROP POLICY IF EXISTS "Allow anon read referral_codes"   ON public.referral_codes;
DROP POLICY IF EXISTS "Service role only on referral_codes" ON public.referral_codes;

-- Only the service role (used server-side) can read/write referral codes
CREATE POLICY "Service role only on referral_codes"
  ON public.referral_codes
  USING (auth.role() = 'service_role');

-- ---------------------------------------------------------------
-- RLS: order_items — inherit orders access pattern
-- ---------------------------------------------------------------
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on order_items" ON public.order_items;
CREATE POLICY "Service role full access on order_items"
  ON public.order_items
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Anyone can insert order_items" ON public.order_items;
CREATE POLICY "Anyone can insert order_items"
  ON public.order_items
  FOR INSERT
  WITH CHECK (true);
