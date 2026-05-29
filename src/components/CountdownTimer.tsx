import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

const CountdownTimer = () => {
    const calculateTimeLeft = (): TimeLeft => {
        // Set target date to 50 days from now
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 50);

        const difference = targetDate.getTime() - new Date().getTime();

        if (difference > 0) {
            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }

        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <section className="py-12 px-4 bg-gradient-to-r from-red-accent/10 via-background to-red-accent/10">
            <div className="container-wide">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="glass-strong rounded-3xl p-8 md:p-12 text-center"
                >
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <Clock className="text-red-accent" size={32} />
                        <h2 className="text-3xl md:text-4xl font-display font-bold uppercase tracking-wider">
                            DROP002
                        </h2>
                    </div>

                    <p className="text-muted-foreground mb-8 text-lg">
                        Limited Time Collection
                    </p>

                    <div className="grid grid-cols-4 gap-4 md:gap-8 max-w-2xl mx-auto">
                        <div className="glass rounded-2xl p-4 md:p-6">
                            <div className="text-3xl md:text-5xl font-display font-bold text-red-accent mb-2">
                                {String(timeLeft.days).padStart(2, '0')}
                            </div>
                            <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider">
                                Days
                            </div>
                        </div>

                        <div className="glass rounded-2xl p-4 md:p-6">
                            <div className="text-3xl md:text-5xl font-display font-bold text-red-accent mb-2">
                                {String(timeLeft.hours).padStart(2, '0')}
                            </div>
                            <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider">
                                Hours
                            </div>
                        </div>

                        <div className="glass rounded-2xl p-4 md:p-6">
                            <div className="text-3xl md:text-5xl font-display font-bold text-red-accent mb-2">
                                {String(timeLeft.minutes).padStart(2, '0')}
                            </div>
                            <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider">
                                Minutes
                            </div>
                        </div>

                        <div className="glass rounded-2xl p-4 md:p-6">
                            <div className="text-3xl md:text-5xl font-display font-bold text-red-accent mb-2">
                                {String(timeLeft.seconds).padStart(2, '0')}
                            </div>
                            <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider">
                                Seconds
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default CountdownTimer;
