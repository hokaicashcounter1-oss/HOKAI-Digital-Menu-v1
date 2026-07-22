import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Sparkles, 
  Flame, 
  Camera, 
  CheckCircle2, 
  Utensils 
} from 'lucide-react';
import { MenuItem, getSpiceConfig } from '../types';

interface FoodGalleryModalProps {
  item: MenuItem | null;
  categoryName?: string;
  onClose: () => void;
}

const ANGLE_LABELS = [
  { title: 'Front View', sub: 'Eye-Level Studio Plating' },
  { title: '45° Elevation', sub: 'Angled Perspective' },
  { title: 'Macro Texture', sub: 'Extreme Ingredient Detail' },
  { title: 'Overhead Flat-Lay', sub: 'Top-Down Slate View' },
  { title: 'Restaurant Ambience', sub: 'Pan-Asian Dining Vibe' }
];

export const FoodGalleryModal: React.FC<FoodGalleryModalProps> = ({ item, categoryName, onClose }) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    setActiveIndex(0);
  }, [item?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!item) return;
      if (e.key === 'Escape') {
        if (isFullscreen) setIsFullscreen(false);
        else onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [item, activeIndex, isFullscreen]);

  if (!item) return null;

  // Image Authenticity Policy: Only display verified real photos.
  let verifiedPhotos: string[] = [];
  if (Array.isArray(item.verifiedImages) && item.verifiedImages.length > 0) {
    verifiedPhotos = item.verifiedImages.filter(v => v.isVerified).map(v => v.url);
  } else if (Array.isArray(item.images) && item.images.length > 0) {
    verifiedPhotos = item.images.filter(img => img && img.trim().length > 0);
  } else if (item.image && item.image.trim().length > 0) {
    verifiedPhotos = [item.image];
  }

  const displayImages: string[] = verifiedPhotos;
  const hasPhotos = displayImages.length > 0;
  const isCustomDish = !!item.isCustomDish;

  const handleNext = () => {
    if (!hasPhotos) return;
    setActiveIndex(prev => (prev + 1) % displayImages.length);
  };

  const handlePrev = () => {
    if (!hasPhotos) return;
    setActiveIndex(prev => (prev - 1 + displayImages.length) % displayImages.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    setTouchStartX(null);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-xl overflow-y-auto"
        onClick={onClose}
      >
        {/* Main Modal Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-5xl bg-[#0F0F0F] border border-[#D4AF37]/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.15)] my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Control Bar */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-[#141414]">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">
                <Camera className="w-4 h-4" />
              </span>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37]">
                  {hasPhotos ? `Verified Food Gallery (${displayImages.length} Photo${displayImages.length > 1 ? 's' : ''})` : 'Image Authenticity Notice'}
                </span>
                <h3 className="text-white font-bold text-sm sm:text-base font-display tracking-wider">
                  {item.name}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-all border border-white/10"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Gallery Viewport (7 cols) */}
            <div 
              className="lg:col-span-7 bg-[#050505] relative flex flex-col justify-between select-none min-h-[340px] sm:min-h-[440px]"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* Active Image Display / Placeholder */}
              <div className="relative w-full h-[320px] sm:h-[400px] flex items-center justify-center p-4 overflow-hidden group">
                {hasPhotos ? (
                  <>
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={activeIndex}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                        src={displayImages[activeIndex]}
                        alt={`${item.name} View ${activeIndex + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-2xl border border-white/10 shadow-2xl cursor-pointer"
                        onClick={() => setIsFullscreen(true)}
                      />
                    </AnimatePresence>

                    {/* Tag Overlay */}
                    <div className="absolute top-6 left-6 z-10 flex flex-col gap-1">
                      <div className="flex items-center gap-2 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-semibold tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>PHOTO {activeIndex + 1} OF {displayImages.length}: VERIFIED REAL FOOD</span>
                      </div>
                      {displayImages.length < 5 && (
                        <div className="bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-amber-500/30 text-amber-300 text-[10px] font-mono tracking-wide w-fit">
                          <span>More photos coming soon</span>
                        </div>
                      )}
                    </div>

                    {/* Expand Fullscreen Button */}
                    <button
                      onClick={() => setIsFullscreen(true)}
                      className="absolute top-6 right-6 z-10 p-2.5 rounded-xl bg-black/80 backdrop-blur-md text-white/80 hover:text-white hover:bg-black border border-white/20 transition-all opacity-90 group-hover:opacity-100"
                      title="Expand Fullscreen"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>

                    {/* Navigation Arrows (only if > 1 image) */}
                    {displayImages.length > 1 && (
                      <>
                        <button
                          onClick={handlePrev}
                          className="absolute left-6 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-black/70 hover:bg-[#D4AF37] hover:text-black text-white border border-white/20 transition-all shadow-xl"
                          title="Previous Photo"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>

                        <button
                          onClick={handleNext}
                          className="absolute right-6 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-black/70 hover:bg-[#D4AF37] hover:text-black text-white border border-white/20 transition-all shadow-xl"
                          title="Next Photo"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full rounded-2xl border border-dashed border-white/20 bg-gradient-to-b from-[#141414] to-[#0A0A0A] flex flex-col items-center justify-center text-center p-6 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                      <Camera className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-white text-base font-bold uppercase tracking-wider font-display mb-1">
                        Authentic Photo Coming Soon
                      </h4>
                      <p className="text-white/60 text-xs max-w-sm font-sans leading-relaxed">
                        In accordance with our <strong className="text-[#D4AF37]">Image Authenticity Policy</strong>, we display only verified real photographs of our dishes.
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-2 text-[10px] text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-3 py-1.5 rounded-xl font-mono">
                      <span>✓ Prepared Fresh on Order at HOKAI</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Thumbnail Strip (only if images present) */}
              {hasPhotos && (
                <div className="p-4 bg-[#0A0A0A] border-t border-white/5 flex items-center justify-center gap-2 sm:gap-3 overflow-x-auto">
                  {displayImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveIndex(idx)}
                      className={`relative flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        activeIndex === idx
                          ? 'border-[#D4AF37] scale-105 shadow-[0_0_12px_rgba(212,175,55,0.4)]'
                          : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/30'
                      }`}
                    >
                      <img 
                        src={img} 
                        alt={`Thumbnail ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 right-1 text-[9px] font-bold bg-black/80 px-1 py-0.5 rounded text-white font-mono">
                        #{idx + 1}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dish Information Sidebar (5 cols) */}
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-[#0F0F0F] space-y-6">
              <div className="space-y-4">
                {/* Category & Diet Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  {categoryName && (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-2.5 py-1 rounded-lg">
                      {categoryName}
                    </span>
                  )}

                  {/* Veg / Non-Veg Indicator */}
                  {item.isVeg ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      Pure Veg
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-950/40 border border-red-500/30 px-2.5 py-1 rounded-lg">
                      <span className="w-2 h-2 rounded-full bg-red-400"></span>
                      Non-Veg
                    </span>
                  )}

                  {/* Spice Level */}
                  {item.spiceLevel > 0 && (
                    <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${getSpiceConfig(item.spiceLevel).badgeBg} ${getSpiceConfig(item.spiceLevel).badgeText} ${getSpiceConfig(item.spiceLevel).badgeBorder}`}>
                      <Flame className="w-3 h-3 flex-shrink-0" />
                      <span>{getSpiceConfig(item.spiceLevel).chilies} {getSpiceConfig(item.spiceLevel).label}</span>
                    </span>
                  )}
                </div>

                {/* Title and Price */}
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold font-display uppercase tracking-wider text-white mb-1">
                    {item.name}
                  </h2>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-mono font-bold text-[#D4AF37]">
                      ₹{item.price}
                    </span>
                    <span className="text-xs text-white/40 uppercase tracking-widest font-sans">
                      • Taxes included
                    </span>
                  </div>
                </div>

                {/* Appetizing Description */}
                <div className="border-t border-b border-white/10 py-4">
                  <h4 className="text-[10px] uppercase tracking-widest text-white/50 font-bold mb-2">
                    Culinary Notes & Flavor Profile
                  </h4>
                  <p className="text-white/80 text-sm leading-relaxed font-sans">
                    {item.description || 'Prepared with authentic Pan-Asian spices and fresh artisanal ingredients by our master chefs.'}
                  </p>
                </div>

                {/* Active Angle Info Box */}
                <div className="bg-[#141414] border border-white/5 p-3.5 rounded-2xl flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37]">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                      {ANGLE_LABELS[activeIndex]?.title}
                    </h5>
                    <p className="text-[11px] text-white/50">
                      {ANGLE_LABELS[activeIndex]?.sub}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-[#D4AF37] hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] flex items-center justify-center gap-2"
                >
                  <Utensils className="w-4 h-4" />
                  Order / Inquire at Table
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Fullscreen Lightbox Modal */}
        <AnimatePresence>
          {isFullscreen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/98 flex flex-col justify-between p-4 sm:p-8"
              onClick={() => setIsFullscreen(false)}
            >
              {/* Fullscreen Header */}
              <div className="flex justify-between items-center z-10">
                <div className="text-white">
                  <span className="text-xs font-mono text-[#D4AF37] uppercase tracking-widest">
                    ANGLE {activeIndex + 1} OF 5 • {ANGLE_LABELS[activeIndex]?.title}
                  </span>
                  <h3 className="text-lg font-bold font-display uppercase tracking-wider">
                    {item.name}
                  </h3>
                </div>

                <button
                  onClick={() => setIsFullscreen(false)}
                  className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Fullscreen Image Container */}
              <div className="relative flex-1 flex items-center justify-center p-2 sm:p-6" onClick={(e) => e.stopPropagation()}>
                <img
                  src={displayImages[activeIndex]}
                  alt={`${item.name} Fullscreen`}
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-[82vh] object-contain rounded-2xl border border-white/10 shadow-2xl"
                />

                <button
                  onClick={handlePrev}
                  className="absolute left-2 sm:left-6 p-4 rounded-full bg-black/80 hover:bg-[#D4AF37] hover:text-black text-white border border-white/20 transition-all shadow-2xl"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={handleNext}
                  className="absolute right-2 sm:right-6 p-4 rounded-full bg-black/80 hover:bg-[#D4AF37] hover:text-black text-white border border-white/20 transition-all shadow-2xl"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Fullscreen Footer Thumbnails */}
              <div className="flex justify-center gap-2 z-10" onClick={(e) => e.stopPropagation()}>
                {displayImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                      activeIndex === idx ? 'border-[#D4AF37] scale-110' : 'border-white/20 opacity-50'
                    }`}
                  >
                    <img src={img} alt="Thumb" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};
