ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_count INTEGER DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_sold_out BOOLEAN DEFAULT false;

-- Policy to allow admins to delete bookings
CREATE POLICY "Admins can delete bookings" ON public.bookings FOR DELETE USING (has_role(auth.uid(), 'admin'));
