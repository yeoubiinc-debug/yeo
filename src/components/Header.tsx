import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingBag, Search, Globe, ChevronDown, User, LogOut, Shield, Phone, Mail } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import SearchModal from "./SearchModal";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const { setOpen, getTotalItems } = useCartStore();
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "#drops" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ];

  const currencies = ["INR", "USD", "EUR"];

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed left-0 right-0 z-50 bg-white/80 backdrop-blur-md top-0"
      >
        <div className="container-wide px-4 md:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Left Actions - Search & User */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(true)}
                className="md:hidden p-2 text-foreground hover:text-muted-foreground transition-colors"
              >
                <Menu size={24} />
              </button>

              {/* User Menu (desktop only) */}
              <div className="relative hidden md:block">
                <button
                  onClick={() => user ? setIsUserMenuOpen(!isUserMenuOpen) : navigate('/auth')}
                  className="p-2 hover:text-muted-foreground transition-colors"
                >
                  <User size={20} />
                </button>
                <AnimatePresence>
                  {isUserMenuOpen && user && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 mt-2 glass-strong rounded-lg p-3 min-w-[160px]"
                    >
                      <p className="text-xs text-muted-foreground px-3 pb-2 border-b border-border mb-2 truncate">
                        {user.email}
                      </p>
                      {isAdmin && (
                        <button
                          onClick={() => {
                            navigate('/admin');
                            setIsUserMenuOpen(false);
                          }}
                          className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm hover:bg-muted rounded transition-colors text-red-accent"
                        >
                          <Shield size={16} />
                          Admin Panel
                        </button>
                      )}
                      <button
                        onClick={async () => {
                          await signOut();
                          setIsUserMenuOpen(false);
                        }}
                        className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm hover:bg-muted rounded transition-colors"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-6 ml-4">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-caption hover:text-foreground transition-colors duration-300"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>

            {/* Logo - Center */}
            <Link to="/" className="absolute left-1/2 -translate-x-1/2">
              <img
                src="/logo-placeholder.png"
                alt="YEOUBI"
                className="h-10 md:h-12 w-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            </Link>

            {/* Right Actions - Cart */}
            <div className="flex items-center gap-4">
              {/* Language/Currency Selector */}
              <div className="hidden md:block relative">
                <button
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="flex items-center gap-2 text-caption hover:text-foreground transition-colors"
                >
                  <Globe size={16} />
                  <span>EN / INR</span>
                  <ChevronDown size={14} />
                </button>
                <AnimatePresence>
                  {isLangOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full right-0 mt-2 glass-strong rounded-lg p-3 min-w-[140px]"
                    >
                      {currencies.map((curr) => (
                        <button
                          key={curr}
                          className="block w-full text-left px-3 py-2 text-sm hover:bg-muted rounded transition-colors"
                        >
                          EN / {curr}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 hover:text-muted-foreground transition-colors"
              >
                <Search size={20} />
              </button>

              <button
                onClick={() => setOpen(true)}
                className="relative p-2 hover:text-muted-foreground transition-colors"
              >
                <ShoppingBag size={20} />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-foreground text-background text-xs rounded-full flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Announcement Bar */}
        <div className="border-t border-border/30 bg-background/50">
          <div className="overflow-hidden py-2">
            <div className="marquee-track whitespace-nowrap flex">
              {[...Array(10)].map((_, i) => (
                <span key={i} className="text-caption mx-8">
                  FREE SHIPPING ON ORDERS OVER ₹999 • USE CODE <span className="text-red-accent font-semibold">YEO10</span> FOR 10% OFF
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-background/40 backdrop-blur-xl border-r border-border/50 z-50 p-6 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-10">
                <img
                  src="/logo-placeholder.png"
                  alt="YEOUBI"
                  className="h-8 w-auto"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <h2 className="hidden text-2xl font-brand font-extrabold tracking-[0.02em] uppercase">YEOUBI</h2>
                <button onClick={() => setIsMenuOpen(false)}>
                  <X size={24} />
                </button>
              </div>
              <nav className="space-y-6">
                {navLinks.map((link, i) => (
                  <motion.a
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={link.label}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-xl font-display font-medium hover:text-muted-foreground transition-colors"
                  >
                    {link.label}
                  </motion.a>
                ))}
              </nav>

              <div className="mt-8 pt-8 border-t border-border/50 space-y-6">
                {user ? (
                  <>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Link
                        to="/account"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 text-xl font-display font-medium hover:text-muted-foreground transition-colors mb-6"
                      >
                        <User size={20} />
                        Account
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 text-xl font-display font-medium text-red-accent hover:text-red-accent/80 transition-colors mb-6"
                        >
                          <Shield size={20} />
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={async () => {
                          await signOut();
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center gap-3 text-xl font-display font-medium hover:text-muted-foreground transition-colors"
                      >
                        <LogOut size={20} />
                        Sign Out
                      </button>
                    </motion.div>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Link
                      to="/auth"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 text-xl font-display font-medium hover:text-muted-foreground transition-colors"
                    >
                      <User size={20} />
                      Sign In / Account
                    </Link>
                  </motion.div>
                )}
              </div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-10 pt-6 border-t border-border/50"
              >
                <p className="text-caption mb-4">Currency</p>
                <div className="flex gap-3">
                  {currencies.map((curr) => (
                    <button
                      key={curr}
                      className="glass px-4 py-2 rounded-full text-sm hover:bg-muted transition-colors"
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Header;
