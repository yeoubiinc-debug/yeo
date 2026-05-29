import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const exitTimer = window.setTimeout(() => {
            setIsVisible(false);
            window.setTimeout(onComplete, 500); // Wait for exit animation
        }, 3000); // 3 seconds display

        // Failsafe: even if animations/effects get interrupted, ensure we un-block the app.
        const failsafeTimer = window.setTimeout(() => {
            setIsVisible(false);
            onComplete();
        }, 4500);

        return () => {
            clearTimeout(exitTimer);
            clearTimeout(failsafeTimer);
        };
    }, [onComplete]);


    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="fixed inset-0 z-[100] bg-white flex items-center justify-center flex-col"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="flex flex-col items-center"
                    >
                        <img
                            src="/logo-placeholder.png"
                            alt="YEOUBI"
                            className="h-24 w-auto mb-4"
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SplashScreen;
