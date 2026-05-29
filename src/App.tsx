import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import ProductPage from "./pages/ProductPage";
import SectionPage from "./pages/SectionPage";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import TermsOfService from "./pages/TermsOfService";
import FAQPage from "./pages/FAQPage";
import ShippingPage from "./pages/ShippingPage";
import ReturnPage from "./pages/ReturnPage";
import SizeGuidePage from "./pages/SizeGuidePage";
import AllProductsPage from "./pages/AllProductsPage";
import { useState } from "react";
import SplashScreen from "./components/SplashScreen";
import ContactPopup from "./components/ContactPopup";
import NotFound from "./pages/NotFound";
import { ThemeUpdater } from "./components/ThemeUpdater";
import { AppErrorBoundary } from "./components/AppErrorBoundary";


const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <ThemeUpdater />
            <AppErrorBoundary>
              <BrowserRouter>
                <ContactPopup />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/product/:handle" element={<ProductPage />} />
                  <Route path="/section/:slug" element={<SectionPage />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/terms-of-service" element={<TermsOfService />} />
                  <Route path="/faq" element={<FAQPage />} />
                  <Route path="/shipping" element={<ShippingPage />} />
                  <Route path="/returns" element={<ReturnPage />} />
                  <Route path="/size-guide" element={<SizeGuidePage />} />
                  <Route path="/shop/all" element={<AllProductsPage />} />
                  <Route path="/shop/new-arrivals" element={<AllProductsPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                {showSplash && (
                  <SplashScreen onComplete={() => setShowSplash(false)} />
                )}
              </BrowserRouter>
            </AppErrorBoundary>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;

