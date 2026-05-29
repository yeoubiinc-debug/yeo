import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Truck, Clock, Globe } from "lucide-react";

const ShippingPage = () => {
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
                    <h1 className="text-display mb-12">Shipping Policy</h1>

                    <div className="grid gap-8 md:grid-cols-3 mb-12">
                        <div className="glass p-6 rounded-2xl text-center">
                            <Clock className="mx-auto mb-4 text-red-accent" size={32} />
                            <h3 className="font-display font-bold mb-2">Processing Time</h3>
                            <p className="text-sm text-muted-foreground">Orders are processed within 24-48 hours.</p>
                        </div>
                        <div className="glass p-6 rounded-2xl text-center">
                            <Truck className="mx-auto mb-4 text-red-accent" size={32} />
                            <h3 className="font-display font-bold mb-2">Delivery Time</h3>
                            <p className="text-sm text-muted-foreground">3-7 business days depending on your location.</p>
                        </div>
                        <div className="glass p-6 rounded-2xl text-center">
                            <Globe className="mx-auto mb-4 text-red-accent" size={32} />
                            <h3 className="font-display font-bold mb-2">Free Shipping</h3>
                            <p className="text-sm text-muted-foreground">On all orders above ₹999 across India.</p>
                        </div>
                    </div>

                    <div className="space-y-8 text-body">
                        <section>
                            <h2 className="text-2xl font-display font-bold mb-4 uppercase tracking-wider">Domestic Shipping</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We provide shipping across India. Standard delivery charges of ₹50 apply to orders below ₹999. Online prepaid orders are eligible for free shipping.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold mb-4 uppercase tracking-wider">Tracking Your Order</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Once your order is shipped, you will receive a tracking link via email and WhatsApp to monitor your shipment's progress.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold mb-4 uppercase tracking-wider">Important Note</h2>
                            <p className="text-muted-foreground leading-relaxed italic">
                                Please ensure the delivery address and contact details are accurate to avoid delays. If a package is returned due to incorrect information, additional shipping charges may apply for re-delivery.
                            </p>
                        </section>
                    </div>
                </motion.div>
            </main>
            <Footer />
        </div>
    );
};

export default ShippingPage;
