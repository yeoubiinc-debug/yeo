import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SiteSettings {
  id: string;
  countdown_date: string | null;
  welcome_message: string | null;
  welcome_image_url: string | null;
  welcome_enabled: boolean;
  delivery_charges: number;
  free_delivery_on_prepaid: boolean;
  logo_url: string | null;
}

export const useSiteSettings = () => {
  return useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as SiteSettings | null;
    },
  });
};
