import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const TermsOfService = () => {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />
            <main className="pt-32 pb-20 px-4 container-wide">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-4xl mx-auto"
                >
                    <h1 className="text-display mb-12">Terms of Service</h1>

                    <div className="space-y-12 text-body">
                        <section>
                            <h2 className="text-2xl font-display font-bold mb-4 uppercase tracking-wider">1. Acceptance of Terms</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                By accessing and using the YEOUBI website (the "Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold mb-4 uppercase tracking-wider">2. Product Information</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We strive to display our products as accurately as possible. However, we cannot guarantee that your monitor's display of any color will be accurate. All products are subject to availability.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold mb-4 uppercase tracking-wider">3. Pricing and Payments</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Prices for our products are subject to change without notice. We reserve the right to modify or discontinue the Service at any time. We accept various payment methods as indicated on the site. For UPI payments, users must follow the instructions provided during the checkout process.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold mb-4 uppercase tracking-wider">4. Shipping and Returns</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Shipping times may vary based on location. Our return policy is governed by separate guidelines available on our website. Please review our shipping policy before making a purchase.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold mb-4 uppercase tracking-wider">5. Intellectual Property</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                All content on this site, including but not limited to text, graphics, logos, and images, is the property of YEOUBI and is protected by intellectual property laws.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold mb-4 uppercase tracking-wider">6. Limitation of Liability</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                YEOUBI shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with the use of our products or Service.
                            </p>
                        </section>

                        <section className="pt-8 border-t border-border">
                            <p className="text-sm text-muted-foreground">
                                Last Updated: December 2024
                            </p>
                        </section>
                    </div>
                </motion.div>
            </main>
            <Footer />
        </div>
    );
};

export default TermsOfService;
