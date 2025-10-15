-- Migration: add payments table and subscription_tier to users

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  stripe_id TEXT,
  user_id BIGINT,
  funnel_id BIGINT,
  amount NUMERIC(10,2),
  currency TEXT DEFAULT 'usd',
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add subscription_tier to users
ALTER TABLE IF EXISTS users
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_stripe_id ON payments(stripe_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
