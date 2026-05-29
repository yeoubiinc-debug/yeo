import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

function hexToHSL(hex: string) {
  let r = 0, g = 0, b = 0;
  if (hex.length == 4) {
    r = parseInt("0x" + hex[1] + hex[1]);
    g = parseInt("0x" + hex[2] + hex[2]);
    b = parseInt("0x" + hex[3] + hex[3]);
  } else if (hex.length == 7) {
    r = parseInt("0x" + hex[1] + hex[2]);
    g = parseInt("0x" + hex[3] + hex[4]);
    b = parseInt("0x" + hex[5] + hex[6]);
  }
  r /= 255;
  g /= 255;
  b /= 255;

  const cmin = Math.min(r, g, b),
    cmax = Math.max(r, g, b),
    delta = cmax - cmin;
  let h = 0, s = 0, l = 0;

  if (delta == 0) h = 0;
  else if (cmax == r) h = ((g - b) / delta) % 6;
  else if (cmax == g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);
  if (h < 0) h += 360;
  l = (cmax + cmin) / 2;
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return `${h} ${s}% ${l}%`;
}

function applyTheme(data: {
  theme_color?: string | null;
  background_color?: string | null;
  text_color?: string | null;
}) {
  if (data.theme_color) {
    const hsl = hexToHSL(data.theme_color);
    document.documentElement.style.setProperty('--primary', hsl);
    document.documentElement.style.setProperty('--red-accent', hsl);
  }
  if (data.background_color) {
    const hsl = hexToHSL(data.background_color);
    document.documentElement.style.setProperty('--background', hsl);
    document.documentElement.style.setProperty('--card', hsl);
    document.documentElement.style.setProperty('--popover', hsl);
  }
  if (data.text_color) {
    const hsl = hexToHSL(data.text_color);
    document.documentElement.style.setProperty('--foreground', hsl);
    document.documentElement.style.setProperty('--card-foreground', hsl);
    document.documentElement.style.setProperty('--popover-foreground', hsl);
  }
}

export const ThemeUpdater = () => {
  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')

          .select('theme_color, background_color, text_color')
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          applyTheme(data);
        }
      } catch (err) {
        console.error("Failed to fetch theme", err);
      }
    };

    fetchTheme();

    const channel = supabase
      .channel('store-settings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_settings',

        },
        (payload: { new?: any }) => {
          if (payload?.new) {
            applyTheme(payload.new as {
              theme_color?: string | null;
              background_color?: string | null;
              text_color?: string | null;
            });
          }
        }

      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return null;
};