import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import comingSoonBg from "@/assets/coming-soon.jpg";

const ComingSoon = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [countdownDate, setCountdownDate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchCountdownDate = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('countdown_date')
        .limit(1)
        .maybeSingle();

      if (data?.countdown_date) {
        setCountdownDate(new Date(data.countdown_date));
      }
    };

    fetchCountdownDate();
  }, []);

  useEffect(() => {
    if (!countdownDate) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = countdownDate.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / (1000 * 60)) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [countdownDate]);

  if (!countdownDate) return null;

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={comingSoonBg}
          alt="Coming Soon"
          className="w-full h-full object-cover blur-sm scale-105"
        />
        <div className="absolute inset-0 bg-background/80" />
      </div>

      <div className="relative z-10 container-wide px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-caption mb-4">COMING SOON</p>
          <h2 className="text-display mb-6">DROP 002</h2>
          <p className="text-subhead mb-12 max-w-xl mx-auto">
            Something bold is on the horizon. Be the first to know.
          </p>

          {/* Countdown */}
          <div className="flex justify-center gap-4 md:gap-8 mb-12">
            {Object.entries(timeLeft).map(([label, value]) => (
              <div key={label} className="glass-card text-center min-w-[80px] md:min-w-[100px]">
                <div className="text-3xl md:text-5xl font-display font-bold mb-1">
                  {String(value).padStart(2, "0")}
                </div>
                <div className="text-caption">{label.toUpperCase()}</div>
              </div>
            ))}
          </div>

          {/* Notify Form */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 glass px-6 py-4 rounded-full text-foreground placeholder:text-muted-foreground 
                         focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
            <button className="glass-btn-primary whitespace-nowrap">
              Notify Me
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ComingSoon;
