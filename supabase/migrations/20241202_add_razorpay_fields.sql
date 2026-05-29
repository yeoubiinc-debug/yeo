-- 2024-12-02-add-razorpay-fields.sql
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS status varchar(20) NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS razorpay_payment_id varchar(255),
  ADD COLUMN IF NOT EXISTS fee_amount numeric(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false;
