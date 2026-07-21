import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize2, X } from 'lucide-react';

interface GallerySectionProps {
  images: string[];
}

export default function GallerySection({ images }: GallerySectionProps) {
  const [activeImage, setActiveImage] = useState<string | null>(null);

  return (
    <section id="gallery" className="relative py-24 bg-[#0B0B0B]">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-6 h-[1px] bg-[#D4AF37]/60" />
            <span className="text-sm font-sans tracking-[0.3em] uppercase text-[#D4AF37]">Visual Splendor</span>
            <span className="w-6 h-[1px] bg-[#D4AF37]/60" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold font-display text-white tracking-wide">
            Our Culinary Gallery
          </h2>
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((img, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className="group relative aspect-square overflow-hidden rounded-2xl bg-[#121212] border border-white/5 cursor-pointer"
              onClick={() => setActiveImage(img)}
            >
              {/* Image */}
              <img
                src={img}
                alt={`HOKAI dish ${idx + 1}`}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                referrerPolicy="no-referrer"
                loading="lazy"
              />

              {/* Hover Dark Overlay with Zoom Icon */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                <div className="w-12 h-12 rounded-full border border-[#D4AF37] bg-black/80 flex items-center justify-center text-[#D4AF37] transform scale-90 group-hover:scale-100 transition-transform duration-300">
                  <Maximize2 className="w-5 h-5" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox / Zoom Overlay */}
      <AnimatePresence>
        {activeImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md"
            onClick={() => setActiveImage(null)}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveImage(null)}
              className="absolute top-6 right-6 p-2 rounded-full border border-white/10 bg-[#0B0B0B] text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Premium Container */}
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()} // Prevent close on clicking image
            >
              <img
                src={activeImage}
                alt="Selected HOKAI Dish Detail"
                className="w-full h-auto max-h-[80vh] object-contain rounded-2xl"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 text-center">
                <p className="text-sm tracking-[0.1em] uppercase font-sans text-[#D4AF37]">
                  HOKAI Pan-Asian Signature Selection
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
