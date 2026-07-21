import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, X, Lock, Shield, Eye, Compass, Home, UtensilsCrossed, 
  Sparkles, MapPin, Phone, Instagram, Facebook, Heart
} from 'lucide-react';

// Import Types
import { Category, MenuItem, WebsiteContent } from './types';

// Import Fallback Mock Data
import { fallbackCategories, fallbackMenuItems, fallbackWebsiteContent } from './mockData';

// Import Custom Modular Components
import HeroSection from './components/HeroSection';
import MenuSection from './components/MenuSection';
import AboutSection from './components/AboutSection';
import GallerySection from './components/GallerySection';
import ContactSection from './components/ContactSection';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  // Website states
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [websiteContent, setWebsiteContent] = useState<WebsiteContent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Navigation & Admin overlays
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [adminToken, setAdminToken] = useState<string | null>(localStorage.getItem('hokai-admin-token'));
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);

  // Load website data with a 2.5-second timeout safeguard to prevent infinite loading
  const loadData = async () => {
    const timeoutPromise = new Promise<void>((resolve) => {
      setTimeout(() => {
        console.warn('[App] API load timed out (2.5s). Falling back to local data.');
        resolve();
      }, 2500);
    });

    try {
      let catData: Category[] = [];
      let itemData: MenuItem[] = [];
      let contentData: WebsiteContent | null = null;

      const fetchData = async () => {
        try {
          const catRes = await fetch('/api/categories');
          if (catRes.ok) catData = await catRes.json();
        } catch (err) {
          console.warn('[App] Error fetching categories:', err);
        }

        try {
          const itemRes = await fetch('/api/menu-items');
          if (itemRes.ok) itemData = await itemRes.json();
        } catch (err) {
          console.warn('[App] Error fetching menu-items:', err);
        }

        try {
          const contentRes = await fetch('/api/website-content');
          if (contentRes.ok) contentData = await contentRes.json();
        } catch (err) {
          console.warn('[App] Error fetching website-content:', err);
        }
      };

      // Race the actual fetch against our timeout promise
      await Promise.race([fetchData(), timeoutPromise]);

      setCategories(catData && catData.length > 0 ? catData : fallbackCategories);
      setMenuItems(itemData && itemData.length > 0 ? itemData : fallbackMenuItems);
      setWebsiteContent(contentData || fallbackWebsiteContent);
    } catch (error) {
      console.error('Error fetching digital menu data, using fallbacks:', error);
      setCategories(fallbackCategories);
      setMenuItems(fallbackMenuItems);
      setWebsiteContent(fallbackWebsiteContent);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle successful login
  const handleLoginSuccess = (token: string) => {
    localStorage.setItem('hokai-admin-token', token);
    setAdminToken(token);
    setShowLoginModal(false);
    setIsAdminMode(true);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('hokai-admin-token');
    setAdminToken(null);
    setIsAdminMode(false);
  };

  // Smooth scroll to element by ID
  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      // Offset for sticky header
      const offset = 72;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  if (loading || !websiteContent) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0B0B0B] flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          className="w-12 h-12 rounded-full border-t border-b border-[#D4AF37] mb-4"
        />
        <h2 className="text-white font-display text-sm uppercase tracking-[0.3em] animate-pulse">
          Sourcing Pan-Asian Flavors...
        </h2>
      </div>
    );
  }

  return (
    <div className="bg-[#0B0B0B] min-h-screen relative flex flex-col">
      {/* Luxury Sticky Floating Navigation Header */}
      <nav id="navbar" className="fixed top-0 inset-x-0 z-40 bg-white/5 backdrop-blur-xl border-b border-white/10 h-[72px] px-4 flex items-center justify-between shadow-lg">
        {/* Brand Identity / Logo */}
        <div 
          onClick={() => {
            if (isAdminMode) {
              setIsAdminMode(false);
            } else {
              scrollToSection('home');
            }
          }}
          className="flex flex-col cursor-pointer group"
        >
          <span className="text-2xl font-black tracking-widest text-white font-display group-hover:text-[#D4AF37] transition-colors leading-none uppercase">
            {websiteContent.restaurantName || "HOKAI"}
          </span>
          <span className="text-[9px] font-sans tracking-[0.25em] text-[#D4AF37]/80 leading-none uppercase mt-1 font-medium">
            {websiteContent.restaurantSubtitle || "Pan-Asian Kitchen"}
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-white/70">
          {!isAdminMode ? (
            <>
              <button onClick={() => scrollToSection('home')} className="hover:text-[#D4AF37] transition-colors">Home</button>
              <button onClick={() => scrollToSection('menu')} className="hover:text-[#D4AF37] transition-colors">Menu</button>
              <button onClick={() => scrollToSection('about')} className="hover:text-[#D4AF37] transition-colors">Story</button>
              <button onClick={() => scrollToSection('gallery')} className="hover:text-[#D4AF37] transition-colors">Gallery</button>
              <button onClick={() => scrollToSection('contact')} className="hover:text-[#D4AF37] transition-colors">Contact</button>
            </>
          ) : (
            <span className="text-emerald-400 text-[10px] bg-emerald-950/40 border border-emerald-500/20 px-3 py-1 rounded-full uppercase tracking-widest">
              Live Control Active
            </span>
          )}

          {/* Admin / Exit Control Session Toggle */}
          {adminToken ? (
            <button
              onClick={() => setIsAdminMode(!isAdminMode)}
              id="btn-admin-panel"
              className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest border transition-all ${
                isAdminMode
                  ? 'bg-[#D4AF37] text-black border-[#D4AF37] hover:bg-amber-400'
                  : 'bg-white/5 text-[#D4AF37] border-white/10 hover:bg-white/10 backdrop-blur-md'
              }`}
            >
              {isAdminMode ? 'View Public Menu' : 'Admin Control Panel'}
            </button>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              id="btn-admin-gate"
              className="flex items-center gap-1.5 px-5 py-2 rounded-full border border-white/10 hover:border-[#D4AF37] hover:bg-white/10 text-white/90 transition-all bg-white/5 backdrop-blur-md"
            >
              <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
              Staff Login
            </button>
          )}
        </div>

        {/* Mobile Navigation Menu button */}
        <div className="flex md:hidden items-center gap-2">
          {adminToken && (
            <button
              onClick={() => setIsAdminMode(!isAdminMode)}
              className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/5 text-[#D4AF37] border border-white/10 backdrop-blur-md"
            >
              {isAdminMode ? 'Site' : 'Admin'}
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-white hover:text-[#D4AF37] transition-colors bg-white/5 rounded-full border border-white/10 backdrop-blur-md"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Swipe-in Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed inset-0 z-30 bg-[#0B0B0B]/90 backdrop-blur-xl pt-24 px-6 flex flex-col justify-between pb-12 md:hidden"
          >
            <div className="flex flex-col gap-6 text-xl font-display font-medium uppercase tracking-widest text-white/80">
              {!isAdminMode ? (
                <>
                  <button 
                    onClick={() => scrollToSection('home')} 
                    className="text-left py-2 border-b border-white/5 hover:text-[#D4AF37] flex items-center gap-3"
                  >
                    <Home className="w-5 h-5 text-[#D4AF37]" />
                    Home
                  </button>
                  <button 
                    onClick={() => scrollToSection('menu')} 
                    className="text-left py-2 border-b border-white/5 hover:text-[#D4AF37] flex items-center gap-3"
                  >
                    <UtensilsCrossed className="w-5 h-5 text-[#D4AF37]" />
                    Explore Menu
                  </button>
                  <button 
                    onClick={() => scrollToSection('about')} 
                    className="text-left py-2 border-b border-white/5 hover:text-[#D4AF37] flex items-center gap-3"
                  >
                    <Compass className="w-5 h-5 text-[#D4AF37]" />
                    Our Story
                  </button>
                  <button 
                    onClick={() => scrollToSection('gallery')} 
                    className="text-left py-2 border-b border-white/5 hover:text-[#D4AF37] flex items-center gap-3"
                  >
                    <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                    Gallery
                  </button>
                  <button 
                    onClick={() => scrollToSection('contact')} 
                    className="text-left py-2 border-b border-white/5 hover:text-[#D4AF37] flex items-center gap-3"
                  >
                    <MapPin className="w-5 h-5 text-[#D4AF37]" />
                    Hours & Contact
                  </button>
                </>
              ) : (
                <div className="text-[#D4AF37] text-sm uppercase tracking-widest text-center border border-[#D4AF37]/30 py-3 rounded-2xl bg-[#121212]">
                  Live Admin Console Active
                </div>
              )}
            </div>

            {/* Bottom Actions of Mobile Drawer */}
            <div className="space-y-4">
              {adminToken ? (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsAdminMode(!isAdminMode);
                    }}
                    className="w-full py-3.5 rounded-xl bg-[#D4AF37] text-black font-bold uppercase tracking-widest text-xs transition-all"
                  >
                    {isAdminMode ? 'View Website Menu' : 'Open Admin Dashboard'}
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full py-3.5 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 font-bold uppercase tracking-widest text-xs transition-all"
                  >
                    Logout Session
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowLoginModal(true);
                  }}
                  className="w-full py-3.5 rounded-xl bg-white/5 border border-white/10 text-white hover:text-[#D4AF37] hover:border-[#D4AF37] font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4 text-[#D4AF37]" />
                  Staff Login Gate
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CORE DISPLAY (Admin Dashboard vs Public Website) */}
      <main className="flex-grow">
        {isAdminMode && adminToken ? (
          <AdminDashboard
            categories={categories}
            menuItems={menuItems}
            websiteContent={websiteContent}
            onRefreshData={loadData}
            token={adminToken}
            onLogout={handleLogout}
          />
        ) : (
          <>
            {/* PUBLIC WEBSITE VIEW */}
            <HeroSection
              bannerImage={websiteContent.heroBanner}
              restaurantName={websiteContent.restaurantName || "HOKAI"}
              subtitle={websiteContent.restaurantSubtitle || "Pan-Asian Kitchen"}
              onViewMenuClick={() => scrollToSection('menu')}
            />
            <MenuSection
              categories={categories}
              menuItems={menuItems}
            />
            <AboutSection
              aboutText={websiteContent.aboutSection}
            />
            <GallerySection
              images={websiteContent.gallery}
            />
            <ContactSection
              contactInfo={websiteContent.contactInfo}
            />
          </>
        )}
      </main>

      {/* Admin Login Modal Overlay */}
      {showLoginModal && (
        <AdminLogin
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setShowLoginModal(false)}
        />
      )}

      {/* LUXURY BRUSHED GOLD GLOBAL FOOTER */}
      <footer className="bg-[#0B0B0B] border-t border-white/5 py-16 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-radial-gradient from-[#D4AF37]/5 to-transparent blur-3xl pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 relative z-10 flex flex-col items-center">
          {/* Logo */}
          <div className="mb-4">
            <span className="text-3xl font-black tracking-widest text-white font-display block uppercase">
              {websiteContent.restaurantName || "HOKAI"}
            </span>
            <span className="text-[10px] font-sans tracking-[0.3em] text-[#D4AF37] block uppercase mt-1">
              {websiteContent.restaurantSubtitle || "Pan-Asian Kitchen"}
            </span>
          </div>

          <p className="text-white/40 text-xs max-w-sm mx-auto leading-relaxed mb-6 font-sans">
            Crafting premium luxury Pan-Asian culinary traditions in a modern smartphone-friendly, QR-menu integrated digital age.
          </p>

          {/* Social icons */}
          <div className="flex gap-4 mb-8">
            <a 
              href={websiteContent.contactInfo.facebook} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-[#121212] border border-white/5 hover:border-[#D4AF37] flex items-center justify-center text-white/60 hover:text-[#D4AF37] transition-all"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a 
              href={websiteContent.contactInfo.instagram} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-[#121212] border border-white/5 hover:border-[#D4AF37] flex items-center justify-center text-white/60 hover:text-[#D4AF37] transition-all"
            >
              <Instagram className="w-4 h-4" />
            </a>
          </div>

          {/* Copyright, Licensing and Schema */}
          <div className="border-t border-white/5 pt-6 w-full flex flex-col sm:flex-row items-center justify-between text-[10px] text-white/30 uppercase tracking-widest gap-4">
            <span>© 2026 HOKAI PAN-ASIAN KITCHEN • ALL RIGHTS RESERVED</span>
            <span className="flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for Gastronomes
            </span>
          </div>
        </div>

        {/* Structured Restaurant Schema (SEO Enhancement) */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Restaurant",
            "name": "HOKAI - Pan-Asian Kitchen",
            "image": websiteContent.heroBanner,
            "telephone": websiteContent.contactInfo.phone,
            "email": websiteContent.contactInfo.email,
            "address": {
              "@type": "PostalAddress",
              "streetAddress": websiteContent.contactInfo.address,
              "addressLocality": "Luxury Quarter",
              "addressRegion": "HQ"
            },
            "servesCuisine": "Pan-Asian, Sushi, Thai, Chinese",
            "menu": `${window.location.origin}/#menu`,
            "priceRange": "$$$"
          })}
        </script>
      </footer>
    </div>
  );
}
