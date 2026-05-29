import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AlertCircle, Video, ShieldCheck } from "lucide-react";

const ReturnPage = () => {
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
                    <h1 className="text-display mb-12">Return Policy</h1>

                    <div className="glass-strong p-8 rounded-3xl border border-red-accent/30 mb-12">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 bg-red-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                                <Video className="text-red-accent" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-display font-bold text-red-accent mb-2 uppercase tracking-wide">Mandatory Opening Video</h2>
                                <p className="text-body leading-relaxed font-medium">
                                    Returns and replacements are <span className="underline decoration-red-accent decoration-2">ONLY</span> accepted if you provide a continuous, unedited video of you opening the product package for the first time.
                                </p>
                            </div>
                        </div>
                        <p className="text-muted-foreground pl-16">
                            The video must clearly show the shipping label, the sealed condition of the package, and the specific damage or issue you are facing.
                        </p>
                    </div>

                    <div className="space-y-12 text-body">
                        <section>
                            <h2 className="text-2xl font-display font-bold mb-4 uppercase tracking-wider">1. Eligibility for Returns</h2>
                            <ul className="list-disc list-inside space-y-3 text-muted-foreground pl-4">
                                <li>Items must be unworn, unwashed, and in their original condition.</li>
                                <li>All tags and packaging must be intact.</li>
                                <li>Return request must be raised within 7 days of delivery.</li>
                                <li>Clear evidence of manufacturing defect or damage must be shown in the opening video.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold mb-4 uppercase tracking-wider">2. Non-Returnable Items</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Items on clearance sale, personalized items, and innerwear are not eligible for returns due to hygiene and customization reasons.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold mb-4 uppercase tracking-wider">3. Process</h2>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                To initiate a return/replacement:
                            </p>
                            <ol className="list-decimal list-inside space-y-3 text-muted-foreground pl-4">
                                <li>Contact our support team via WhatsApp or Email.</li>
                                <li>Share the <span className="text-foreground font-bold">Opening Video</span> and photos of the damage.</li>
                                <li>Our team will verify the claim within 48 hours.</li>
                                <li>If approved, we will arrange a pickup or provide instructions for return shipping.</li>
                            </ol>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold mb-4 uppercase tracking-wider">4. Refunds</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Approved refunds will be processed within 5-7 business days to your original payment method. For COD orders, refund will be provided as store credit or via bank transfer.
                            </p>
                        </section>
                    </div>
                </motion.div>
            </main>
            <Footer />
        </div>
    );
};

export default ReturnPage;
