import { motion } from 'motion/react';
import { ChefHat, ArrowDown } from 'lucide-react';

interface HeroSectionProps {
  bannerImage: string;
  restaurantName: string;
  subtitle: string;
  onViewMenuClick: () => void;
}

export default function HeroSection({
  bannerImage,
  restaurantName,
  subtitle,
  onViewMenuClick,
}: HeroSectionProps) {
  return (
    <div id="home" className="relative h-screen w-full flex flex-col justify-center items-center overflow-hidden">
      {/* Background Image with Dark Vignette Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
        style={{ 
          backgroundImage: `url(${bannerImage})`,
          filter: 'brightness(0.35)'
        }}
      />
      
      {/* Luxury Golden Light Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#0B0B0B]" />
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#0B0B0B]/40 to-[#0B0B0B]/90" />

      {/* Hero Content Container */}
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto flex flex-col items-center">
        {/* Animated Accent Icon */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-6 flex items-center justify-center w-16 h-16 rounded-full border border-[#D4AF37]/40 bg-[#0B0B0B]/80 backdrop-blur-md shadow-[0_0_15px_rgba(212,175,55,0.15)]"
        >
          <ChefHat className="w-8 h-8 text-[#D4AF37]" />
        </motion.div>

        {/* Restaurant Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl sm:text-7xl md:text-8xl font-black tracking-widest text-white mb-2 font-display uppercase"
          style={{ textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}
        >
          {restaurantName}
        </motion.h1>

        {/* Decorative Divider */}
        <motion.div 
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: '120px' }}
          transition={{ duration: 1, delay: 0.4 }}
          className="h-[1.5px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mb-4"
        />

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-[#D4AF37] text-lg sm:text-xl md:text-2xl font-light tracking-[0.25em] uppercase font-sans mb-10"
        >
          {subtitle}
        </motion.p>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <button 
            onClick={onViewMenuClick}
            id="btn-view-menu-hero"
            className="group relative px-8 py-3.5 rounded-full overflow-hidden border border-[#D4AF37] bg-transparent text-white font-medium tracking-wider uppercase text-sm transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]"
          >
            {/* Sliding Gold Background Fill on Hover */}
            <span className="absolute inset-0 w-full h-full bg-[#D4AF37] transition-all duration-300 transform -translate-x-full group-hover:translate-x-0 -z-10" />
            <span className="flex items-center gap-2 group-hover:text-black transition-colors duration-300">
              Explore Our Menu
              <ArrowDown className="w-4 h-4 animate-bounce" />
            </span>
          </button>
        </motion.div>
      </div>

      {/* Sticky Bottom Scroll Indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-1 opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-pointer" onClick={onViewMenuClick}>
        <span className="text-xs tracking-[0.2em] uppercase font-sans text-white/75">Scroll</span>
        <div className="w-[1.5px] h-8 bg-gradient-to-b from-[#D4AF37] to-transparent" />
      </div>
    </div>
  );
}
