import { motion } from 'motion/react';
import { Sparkles, Utensils, Heart } from 'lucide-react';

interface AboutSectionProps {
  aboutText: string;
}

export default function AboutSection({ aboutText }: AboutSectionProps) {
  return (
    <section id="about" className="relative py-24 bg-[#121212] overflow-hidden border-t border-white/5 border-b border-white/5">
      {/* Decorative luxury backgrounds */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-radial-gradient from-[#D4AF37]/5 to-transparent opacity-40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-radial-gradient from-[#D4AF37]/5 to-transparent opacity-40 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        {/* Eyebrow Label */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="flex items-center justify-center gap-2 mb-3"
        >
          <span className="w-6 h-[1px] bg-[#D4AF37]/60" />
          <span className="text-sm font-sans tracking-[0.3em] uppercase text-[#D4AF37]">The Story</span>
          <span className="w-6 h-[1px] bg-[#D4AF37]/60" />
        </motion.div>

        {/* Section Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-bold font-display text-white mb-8 tracking-wide"
        >
          A Legacy of Pan-Asian Culinary Art
        </motion.h2>

        {/* About Narrative Text */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ delay: 0.2 }}
          className="text-white/80 font-sans text-base sm:text-lg leading-relaxed max-w-3xl mx-auto mb-16 px-4"
        >
          {aboutText}
        </motion.p>

        {/* Brand Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
          {/* Pillar 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 hover:border-[#D4AF37]/35 transition-all duration-300 shadow-xl"
          >
            <div className="w-12 h-12 rounded-full border border-[#D4AF37]/30 bg-black/40 flex items-center justify-center mb-4 backdrop-blur-md">
              <Sparkles className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <h3 className="text-white font-medium text-lg tracking-wide mb-2 font-display">Premium Taste</h3>
            <p className="text-white/60 text-sm leading-relaxed">
              Synthesizing rare Asian spices and hand-selected local premium produce.
            </p>
          </motion.div>

          {/* Pillar 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 hover:border-[#D4AF37]/35 transition-all duration-300 shadow-xl"
          >
            <div className="w-12 h-12 rounded-full border border-[#D4AF37]/30 bg-black/40 flex items-center justify-center mb-4 backdrop-blur-md">
              <Utensils className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <h3 className="text-white font-medium text-lg tracking-wide mb-2 font-display">Master Chefs</h3>
            <p className="text-white/60 text-sm leading-relaxed">
              Years of meticulous culinary training in traditional high-fire wok and sushi assembly.
            </p>
          </motion.div>

          {/* Pillar 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 hover:border-[#D4AF37]/35 transition-all duration-300 shadow-xl"
          >
            <div className="w-12 h-12 rounded-full border border-[#D4AF37]/30 bg-black/40 flex items-center justify-center mb-4 backdrop-blur-md">
              <Heart className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <h3 className="text-white font-medium text-lg tracking-wide mb-2 font-display">Exquisite Vibe</h3>
            <p className="text-white/60 text-sm leading-relaxed">
              An atmosphere tailored exclusively for discerning culinary explorers.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
