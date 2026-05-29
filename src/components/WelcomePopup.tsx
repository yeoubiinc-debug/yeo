import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SiteSettings {
  welcome_enabled: boolean;
  welcome_message: string | null;
  welcome_image_url: string | null;
}

const WelcomePopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('welcome_enabled, welcome_message, welcome_image_url')
        .limit(1)
        .maybeSingle();

      if (data && data.welcome_enabled) {
        setSettings(data);
        // Only show if not already dismissed this session
        const dismissed = sessionStorage.getItem('welcomeDismissed');
        if (!dismissed) {
          setIsOpen(true);
        }
      }
    };

    fetchSettings();
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('welcomeDismissed', 'true');
  };

  if (!settings || !settings.welcome_enabled) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[80]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          >
            <div className="glass-strong rounded-3xl p-8 text-center w-full max-w-md relative overflow-hidden">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full transition-colors z-10"
              >
                <X size={20} />
              </button>

              {settings.welcome_image_url && (
                <div className="w-full h-48 -mt-8 -mx-8 mb-6" style={{ width: 'calc(100% + 4rem)' }}>
                  <img
                    src={settings.welcome_image_url}
                    alt="Welcome"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {settings.welcome_message && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-display font-bold">Welcome!</h3>
                  <p className="text-body whitespace-pre-wrap">{settings.welcome_message}</p>
                </div>
              )}

              <button
                onClick={handleClose}
                className="glass-btn-primary w-full mt-6"
              >
                Continue Shopping
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WelcomePopup;
