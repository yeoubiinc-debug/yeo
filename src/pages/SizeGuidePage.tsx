import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Ruler } from "lucide-react";

const sizes = [
    { size: "S", chest: "44", length: "27", shoulder: "20" },
    { size: "M", chest: "46", length: "28", shoulder: "21" },
    { size: "L", chest: "48", length: "29", shoulder: "22" },
    { size: "XL", chest: "50", length: "30", shoulder: "23" },
    { size: "XXL", chest: "52", length: "31", shoulder: "24" },
];

const SizeGuidePage = () => {
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
                    <div className="flex items-center gap-4 mb-12">
                        <Ruler size={40} className="text-red-accent" />
                        <h1 className="text-display">Size Guide</h1>
                    </div>

                    <div className="glass-strong rounded-3xl p-8 mb-12">
                        <p className="text-body mb-8 text-center text-lg">
                            Our tees feature an <span className="font-bold text-red-accent uppercase">oversized relaxed fit</span>.
                            All measurements are in <span className="italic">inches</span>.
                        </p>

                        {/* Size Table */}
                        <div className="glass rounded-2xl overflow-hidden border border-border/50">
                            <table className="w-full text-base">
                                <thead>
                                    <tr className="bg-muted/30 border-b border-border">
                                        <th className="py-4 px-6 text-left font-display font-bold uppercase tracking-wider">Size</th>
                                        <th className="py-4 px-6 text-center font-display font-bold uppercase tracking-wider">Chest</th>
                                        <th className="py-4 px-6 text-center font-display font-bold uppercase tracking-wider">Length</th>
                                        <th className="py-4 px-6 text-center font-display font-bold uppercase tracking-wider">Shoulder</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sizes.map((item) => (
                                        <tr key={item.size} className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors">
                                            <td className="py-4 px-6 font-bold">{item.size}</td>
                                            <td className="py-4 px-6 text-center text-muted-foreground">{item.chest}"</td>
                                            <td className="py-4 px-6 text-center text-muted-foreground">{item.length}"</td>
                                            <td className="py-4 px-6 text-center text-muted-foreground">{item.shoulder}"</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-8 grid md:grid-cols-2 gap-6">
                            <div className="glass p-6 rounded-2xl border border-border/50">
                                <h3 className="font-display font-bold mb-3 uppercase text-sm tracking-widest">How to Measure</h3>
                                <ul className="text-sm text-muted-foreground space-y-2">
                                    <li><span className="text-foreground font-medium">Chest:</span> Wrap the tape around the fullest part of your chest.</li>
                                    <li><span className="text-foreground font-medium">Length:</span> Measure from the highest point of the shoulder down.</li>
                                    <li><span className="text-foreground font-medium">Shoulder:</span> Measure from one shoulder point to the other across the back.</li>
                                </ul>
                            </div>
                            <div className="glass p-6 rounded-2xl border border-border/50 flex flex-col justify-center text-center">
                                <p className="text-sm text-muted-foreground italic mb-2">
                                    "I prefer a more regular fit, what should I do?"
                                </p>
                                <p className="font-display font-bold text-red-accent">We recommend sizing down by one.</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </main>
            <Footer />
        </div>
    );
};

export default SizeGuidePage;
