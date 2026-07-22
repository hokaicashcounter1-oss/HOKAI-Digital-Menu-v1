import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Flame, Leaf, EyeOff, UtensilsCrossed, Sparkles, Camera, Images, SlidersHorizontal } from 'lucide-react';
import { Category, MenuItem, getSpiceConfig, SPICE_LEVEL_CONFIGS } from '../types';
import { FoodGalleryModal } from './FoodGalleryModal';

interface MenuSectionProps {
  categories: Category[];
  menuItems: MenuItem[];
}

export default function MenuSection({ categories, menuItems }: MenuSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterVegOnly, setFilterVegOnly] = useState<boolean>(false);
  const [filterNonVegOnly, setFilterNonVegOnly] = useState<boolean>(false);
  const [selectedSpiceFilter, setSelectedSpiceFilter] = useState<string>('all');
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<MenuItem | null>(null);

  // Filter out drafts for public view
  const publicItems = useMemo(() => {
    return menuItems.filter(item => !item.isDraft);
  }, [menuItems]);

  // Filter items based on current search query, selected category, diet and spice badges
  const filteredItems = useMemo(() => {
    return publicItems.filter((item) => {
      // Category filter
      const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;

      // Search filter
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Veg / Non-Veg filters
      let matchesDiet = true;
      if (filterVegOnly) {
        matchesDiet = item.isVeg;
      } else if (filterNonVegOnly) {
        matchesDiet = item.isNonVeg;
      }

      // Spice level filter
      let matchesSpice = true;
      if (selectedSpiceFilter !== 'all') {
        matchesSpice = item.spiceLevel === parseInt(selectedSpiceFilter);
      }

      return matchesCategory && matchesSearch && matchesDiet && matchesSpice;
    });
  }, [publicItems, selectedCategory, searchQuery, filterVegOnly, filterNonVegOnly, selectedSpiceFilter]);

  return (
    <section id="menu" className="py-24 bg-[#0B0B0B] relative min-h-screen">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-radial-gradient from-[#D4AF37]/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4">
        {/* Title */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-6 h-[1px] bg-[#D4AF37]/60" />
            <span className="text-sm font-sans tracking-[0.3em] uppercase text-[#D4AF37]">The Menu</span>
            <span className="w-6 h-[1px] bg-[#D4AF37]/60" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold font-display text-white tracking-wide uppercase">
            Symphony of Flavors
          </h2>
          <p className="text-white/60 text-xs sm:text-sm font-sans tracking-widest uppercase mt-2">
            Touch categories to navigate. Prices are in ₹.
          </p>
        </div>

        {/* If database has ZERO menu items */}
        {publicItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-20 px-6 max-w-2xl mx-auto bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden my-6"
          >
            {/* Ambient Golden Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="w-20 h-20 rounded-2xl border border-[#D4AF37]/30 bg-[#0B0B0B] flex items-center justify-center mx-auto mb-6 shadow-[0_0_25px_rgba(212,175,55,0.15)]">
              <UtensilsCrossed className="w-8 h-8 text-[#D4AF37]" />
            </div>

            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="w-6 h-[1px] bg-[#D4AF37]/60" />
              <span className="text-xs font-sans tracking-[0.3em] uppercase text-[#D4AF37]">HOKAI Kitchen Notice</span>
              <span className="w-6 h-[1px] bg-[#D4AF37]/60" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-wide uppercase mb-3">
              Menu is currently being updated.
            </h3>
            <p className="text-white/60 text-sm font-sans tracking-wide leading-relaxed max-w-md mx-auto mb-6">
              Please check back soon. Our culinary team is updating our Pan-Asian selection for your dining experience.
            </p>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-xs text-white/50 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Fresh seasonal delicacies coming soon</span>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Search, Diet Filters & Sticky Category Scroll Container */}
            <div className="sticky top-[72px] z-30 bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-3xl shadow-2xl mb-12 flex flex-col gap-4">
              
              {/* Controls Bar */}
              <div className="flex flex-col sm:flex-row gap-4 items-stretch justify-between">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search favorite dishes, ingredients..."
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-[#D4AF37] transition-all backdrop-blur-md"
                  />
                </div>

                {/* Diet Switches */}
                <div className="flex items-center gap-3">
                  {/* Veg Only */}
                  <button
                    onClick={() => {
                      setFilterVegOnly(!filterVegOnly);
                      setFilterNonVegOnly(false);
                    }}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-semibold tracking-wide border uppercase transition-all ${
                      filterVegOnly 
                        ? 'bg-green-950/40 border-green-500 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]' 
                        : 'bg-white/5 border-white/10 text-white/75 hover:border-white/25 hover:bg-white/10 backdrop-blur-md'
                    }`}
                  >
                    <Leaf className="w-3.5 h-3.5 text-green-400" />
                    Veg Only
                  </button>

                  {/* Non-Veg Only */}
                  <button
                    onClick={() => {
                      setFilterNonVegOnly(!filterNonVegOnly);
                      setFilterVegOnly(false);
                    }}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-semibold tracking-wide border uppercase transition-all ${
                      filterNonVegOnly 
                        ? 'bg-red-950/40 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                        : 'bg-white/5 border-white/10 text-white/75 hover:border-white/25 hover:bg-white/10 backdrop-blur-md'
                    }`}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 border border-white/20" />
                    Non-Veg
                  </button>
                </div>
              </div>

              {/* Spice Level Filter Bar */}
              <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 no-scrollbar border-t border-white/5">
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono font-bold flex items-center gap-1 flex-shrink-0 pr-1">
                  <Flame className="w-3 h-3 text-red-500" /> Spice:
                </span>

                <button
                  onClick={() => setSelectedSpiceFilter('all')}
                  className={`flex-shrink-0 px-3 py-1 rounded-xl text-[11px] font-bold uppercase tracking-wider border transition-all ${
                    selectedSpiceFilter === 'all'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                      : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  All
                </button>

                {[1, 2, 3, 4, 5].map((level) => {
                  const config = getSpiceConfig(level);
                  const isSelected = selectedSpiceFilter === level.toString();
                  return (
                    <button
                      key={level}
                      onClick={() => setSelectedSpiceFilter(isSelected ? 'all' : level.toString())}
                      className={`flex-shrink-0 px-2.5 py-1 rounded-xl text-[11px] font-bold tracking-wider border transition-all flex items-center gap-1 ${
                        isSelected
                          ? `${config.badgeBg} ${config.badgeBorder} ${config.badgeText} ring-1 ring-amber-400/50 shadow-md`
                          : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <span>{config.chilies}</span>
                      <span>{config.shortLabel}</span>
                    </button>
                  );
                })}
              </div>

              {/* Category tabs: Hide tabs if 0 categories, show message */}
              {categories.length === 0 ? (
                <div className="py-2 px-4 bg-black/30 border border-white/10 rounded-2xl text-center text-white/50 text-xs uppercase tracking-widest font-sans">
                  No menu categories available.
                </div>
              ) : (
                /* Sticky horizontal swipeable category bar */
                <div className="flex overflow-x-auto gap-2.5 pb-2 pt-1 no-scrollbar -mx-4 px-4 scroll-smooth">
                  {/* "All" Category Option */}
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`flex-shrink-0 px-5 py-2.5 rounded-2xl text-xs font-semibold uppercase tracking-widest border transition-all duration-300 ${
                      selectedCategory === 'all'
                        ? 'bg-[#D4AF37] border-[#D4AF37] text-black font-bold shadow-[0_0_12px_rgba(212,175,55,0.35)]'
                        : 'bg-white/5 border-white/10 text-white/70 hover:border-white/25 hover:bg-white/10 backdrop-blur-md'
                    }`}
                  >
                    All Selection
                  </button>

                  {/* Individual categories */}
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex-shrink-0 px-5 py-2.5 rounded-2xl text-xs font-semibold uppercase tracking-widest border transition-all duration-300 ${
                        selectedCategory === cat.id
                          ? 'bg-[#D4AF37] border-[#D4AF37] text-black font-bold shadow-[0_0_12px_rgba(212,175,55,0.35)]'
                          : 'bg-white/5 border-white/10 text-white/70 hover:border-white/25 hover:bg-white/10 backdrop-blur-md'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dishes Listing Section */}
            <AnimatePresence mode="popLayout">
              {filteredItems.length > 0 ? (
                <motion.div 
                  layout
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {filteredItems.map((item) => {
                    const itemCategory = categories.find(c => c.id === item.categoryId);
                    return (
                    <motion.div
                      layout
                      key={item.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35 }}
                      className="bg-white/5 border border-white/10 backdrop-blur-xl hover:border-[#D4AF37]/45 rounded-2xl overflow-hidden p-4 flex gap-4 shadow-xl transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.7)] hover:bg-white/10 cursor-pointer group"
                      onClick={() => setSelectedGalleryItem(item)}
                    >
                      {/* Food Image or Authentic Placeholder (Left side) */}
                      {(() => {
                        const availablePhotos = Array.isArray(item.images) ? item.images.filter(img => img && img.trim().length > 0) : [];
                        if (availablePhotos.length === 0 && item.image && item.image.trim().length > 0) {
                          availablePhotos.push(item.image);
                        }
                        const displayImg = availablePhotos[0];
                        const photoCount = availablePhotos.length;

                        return (
                          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl overflow-hidden flex-shrink-0 relative bg-[#0B0B0B] border border-white/5">
                            {displayImg ? (
                              <>
                                <img
                                  src={displayImg}
                                  alt={item.name}
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                  referrerPolicy="no-referrer"
                                  loading="lazy"
                                />
                                
                                {/* Photo count badge */}
                                <div className="absolute bottom-2 right-2 z-10 bg-black/85 backdrop-blur-md px-2 py-0.5 rounded-lg border border-[#D4AF37]/40 text-[#D4AF37] text-[10px] font-bold flex items-center gap-1 shadow-lg group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
                                  <Camera className="w-3 h-3" />
                                  <span>{photoCount} Photo{photoCount > 1 ? 's' : ''}</span>
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-full bg-gradient-to-b from-[#181818] to-[#0D0D0D] border border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center p-2 text-center text-white/50 space-y-1">
                                <Camera className="w-6 h-6 text-[#D4AF37]/80" />
                                <span className="text-[9px] font-bold uppercase tracking-wider text-white/70">
                                  Photo Coming Soon
                                </span>
                                <span className="text-[8px] text-[#D4AF37] font-mono">
                                  Fresh On Order
                                </span>
                              </div>
                            )}
                            
                            {/* Diet Mark Overlays on top left */}
                            <div className="absolute top-2 left-2 z-10 flex gap-1">
                              {item.isVeg && (
                                <div className="bg-[#0B0B0B]/85 backdrop-blur-sm border border-green-500/30 rounded-lg p-1.5 flex items-center justify-center shadow-lg" title="Pure Vegetarian">
                                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-green-950" />
                                </div>
                              )}
                              {item.isNonVeg && (
                                <div className="bg-[#0B0B0B]/85 backdrop-blur-sm border border-red-500/30 rounded-lg p-1.5 flex items-center justify-center shadow-lg" title="Non-Vegetarian">
                                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-red-950" />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Food Content details (Right side) */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          {/* Name & Pricing row */}
                          <div className="flex justify-between items-start gap-2 mb-1.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="text-white text-base sm:text-lg font-bold tracking-wide uppercase font-display leading-snug group-hover:text-[#D4AF37] transition-colors">
                                {item.name}
                              </h3>
                              {item.spiceLevel > 0 && (
                                <span 
                                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${getSpiceConfig(item.spiceLevel).badgeBg} ${getSpiceConfig(item.spiceLevel).badgeText} ${getSpiceConfig(item.spiceLevel).badgeBorder}`}
                                  title={`Spice Level: ${getSpiceConfig(item.spiceLevel).label}`}
                                >
                                  <span>{getSpiceConfig(item.spiceLevel).chilies}</span>
                                  <span className="hidden sm:inline">{getSpiceConfig(item.spiceLevel).shortLabel}</span>
                                </span>
                              )}
                            </div>
                            <span className="text-[#D4AF37] font-bold text-base sm:text-lg font-mono flex-shrink-0">
                              ₹{item.price}
                            </span>
                          </div>

                          {/* Description */}
                          <p className="text-white/60 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-3">
                            {item.description}
                          </p>
                        </div>

                        {/* Metadata & badges row */}
                        <div className="flex items-center justify-between border-t border-white/5 pt-2.5">
                          {/* Diet text */}
                          <span className={`text-[10px] uppercase font-sans tracking-[0.1em] px-2 py-0.5 rounded-full border ${
                            item.isVeg 
                              ? 'border-green-500/20 bg-green-950/20 text-green-400' 
                              : 'border-red-500/20 bg-red-950/20 text-red-400'
                          }`}>
                            {item.isVeg ? 'Vegetarian' : 'Pan-Asian Non-Veg'}
                          </span>

                          {/* View 5 Photos CTA button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedGalleryItem(item);
                            }}
                            className="flex items-center gap-1 text-[10px] font-bold text-[#D4AF37] hover:text-amber-300 uppercase tracking-widest transition-all"
                          >
                            <Images className="w-3 h-3" />
                            <span>Gallery</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-24 bg-[#121212]/30 rounded-3xl border border-white/5 p-8"
                >
                  <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center mx-auto mb-4 bg-[#0B0B0B]">
                    <EyeOff className="w-6 h-6 text-white/40" />
                  </div>
                  <h3 className="text-white text-lg font-display mb-2">No Gastronomic Selections Found</h3>
                  <p className="text-white/40 text-sm max-w-sm mx-auto leading-relaxed">
                    We couldn't find any items matching your exact filter combination. Try selecting a different category or resetting filters.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Food Gallery Modal Popup */}
      <FoodGalleryModal
        item={selectedGalleryItem}
        categoryName={categories.find(c => c.id === selectedGalleryItem?.categoryId)?.name}
        onClose={() => setSelectedGalleryItem(null)}
      />
    </section>
  );
}
