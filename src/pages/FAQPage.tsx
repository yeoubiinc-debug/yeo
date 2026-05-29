import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FAQ from "@/components/FAQ";

const FAQPage = () => {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />
            <main className="pt-32">
                <FAQ />
            </main>
            <Footer />
        </div>
    );
};

export default FAQPage;
