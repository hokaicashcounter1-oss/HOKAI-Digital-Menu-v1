import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Flame, Leaf, EyeOff } from 'lucide-react';
import { Category, MenuItem } from '../types';

interface MenuSectionProps {
  categories: Category[];
  menuItems: MenuItem[];
}

export default function MenuSection({ categories, menuItems }: MenuSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterVegOnly, setFilterVegOnly] = useState<boolean>(false);
  const [filterNonVegOnly, setFilterNonVegOnly] = useState<boolean>(false);

  // Filter items based on current search query, selected category and food badges
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Hide drafts from general public (unless it is preview mode, handled appropriately)
      if (item.isDraft) return false;

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

      return matchesCategory && matchesSearch && matchesDiet;
    });
  }, [menuItems, selectedCategory, searchQuery, filterVegOnly, filterNonVegOnly]);

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

          {/* Sticky horizontal swipeable category bar */}
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
        </div>

        {/* Dishes Listing Section */}
        <AnimatePresence mode="popLayout">
          {filteredItems.length > 0 ? (
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {filteredItems.map((item) => (
                <motion.div
                  layout
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35 }}
                  className="bg-white/5 border border-white/10 backdrop-blur-xl hover:border-[#D4AF37]/45 rounded-2xl overflow-hidden p-4 flex gap-4 shadow-xl transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.7)] hover:bg-white/10"
                >
                  {/* Food Image (Left side) */}
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl overflow-hidden flex-shrink-0 relative bg-[#0B0B0B] border border-white/5">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    
                    {/* Diet Mark Overlays on top left */}
                    <div className="absolute top-2 left-2 z-10 flex gap-1">
                      {item.isVeg && (
                        <div className="bg-[#0B0B0B]/85 backdrop-blur-sm border border-green-500/30 rounded-lg p-1.5 flex items-center justify-center shadow-lg">
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-green-950" />
                        </div>
                      )}
                      {item.isNonVeg && (
                        <div className="bg-[#0B0B0B]/85 backdrop-blur-sm border border-red-500/30 rounded-lg p-1.5 flex items-center justify-center shadow-lg">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-red-950" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Food Content details (Right side) */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      {/* Name & Pricing row */}
                      <div className="flex justify-between items-start gap-2 mb-1.5">
                        <h3 className="text-white text-base sm:text-lg font-bold tracking-wide uppercase font-display leading-snug">
                          {item.name}
                        </h3>
                        <span className="text-[#D4AF37] font-bold text-base sm:text-lg font-mono">
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

                      {/* Spice Indicator */}
                      {item.spiceLevel > 0 && (
                        <div className="flex items-center gap-0.5" title={`Spice Level: ${item.spiceLevel}`}>
                          {Array.from({ length: item.spiceLevel }).map((_, i) => (
                            <Flame key={i} className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
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
      </div>
    </section>
  );
}
