-- Add per-size stock & sold-out management for each product
-- Creates: public.product_size_inventory

CREATE TABLE IF NOT EXISTS public.product_size_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  stock_count INTEGER NOT NULL DEFAULT 0,
  is_sold_out BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT product_size_inventory_unique_product_size UNIQUE (product_id, size)
);

-- Enable RLS
ALTER TABLE public.product_size_inventory ENABLE ROW LEVEL SECURITY;

-- Policies
-- Admins can manage all inventory
CREATE POLICY "Admins can manage product size inventory"
  ON public.product_size_inventory
  FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Anyone can view active product inventory for active products
CREATE POLICY "Anyone can view inventory for active products"
  ON public.product_size_inventory
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.products p
      WHERE p.id = product_size_inventory.product_id
        AND p.is_active = true
    )
  );

-- Keep updated_at in sync (simple trigger)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_product_size_inventory_updated_at ON public.product_size_inventory;
CREATE TRIGGER trg_product_size_inventory_updated_at
BEFORE UPDATE ON public.product_size_inventory
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

