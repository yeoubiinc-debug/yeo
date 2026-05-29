import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Loader2, Package } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";

const AllProductsPage = () => {
    const { data: products, isLoading } = useProducts();

    return (
        <>
            <Helmet>
                <title>All Products | YEOUBI</title>
                <meta name="description" content="Browse all YEOUBI premium streetwear products." />
            </Helmet>

            <div className="min-h-screen bg-background text-foreground">
                <Header />
                <CartDrawer />

                <main className="pt-32 pb-20 px-4 container-wide">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <h1 className="text-display mb-4">All Products</h1>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Explore our complete collection of premium streetwear.
                        </p>
                    </motion.div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="animate-spin" size={32} />
                        </div>
                    ) : products && products.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <Package size={64} className="mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-2xl font-display font-bold mb-2">No Products Yet</h3>
                            <p className="text-muted-foreground">Check back soon for new additions!</p>
                        </div>
                    )}
                </main>

                <Footer />
            </div>
        </>
    );
};

export default AllProductsPage;
