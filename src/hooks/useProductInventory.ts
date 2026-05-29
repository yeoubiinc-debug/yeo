import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type ProductSizeInventoryRow = {
  product_id: string;
  size: string;
  stock_count: number;
  is_sold_out: boolean;
};


export const useProductInventory = (productId: string | null) => {
  return useQuery({
    queryKey: ['productInventory', productId],
    enabled: !!productId,
    queryFn: async () => {
      if (!productId) return [] as ProductSizeInventoryRow[];

      const { data, error } = await (supabase as any)
        .from('product_size_inventory')
        .select('product_id, size, stock_count, is_sold_out')
        .eq('product_id', productId);

      // Important: don't block product rendering if inventory table/policies aren't ready.
      if (error) return [] as ProductSizeInventoryRow[];

      return (data || []) as unknown as ProductSizeInventoryRow[];


    },
  });
};

