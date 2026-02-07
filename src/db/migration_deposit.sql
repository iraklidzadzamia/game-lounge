-- Migration: Deposit Payment System
-- Description: Adds 'deposit' payment status and deposit_amount field

-- 1. Drop old constraint (if exists)
ALTER TABLE bookings 
  DROP CONSTRAINT IF EXISTS bookings_payment_status_check;

-- 2. Add new constraint with 'deposit' option
ALTER TABLE bookings
  ADD CONSTRAINT bookings_payment_status_check 
  CHECK (payment_status IN ('paid', 'unpaid', 'deposit'));

-- 3. Add deposit_amount column
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS deposit_amount numeric DEFAULT 0;

-- Note: Run this in Supabase SQL Editor
