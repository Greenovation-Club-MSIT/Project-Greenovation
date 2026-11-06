import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Image as ImageIcon, BookOpen, X, Expand, ExternalLink, FileText } from 'lucide-react';
import { SectionHeader } from '../ui/Shared';
import { Magazine } from '../../types';

export const GallerySection: React.FC = () => {
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedMagazine, setSelectedMagazine] = useState<Magazine | null>(null);

  useEffect(() => {
    fetch('/data/gallery.json')
      .then(res => res.json())
      .then(data => setGalleryImages(data))
      .catch(err => console.error('Error fetching gallery images:', err));

    fetch('/data/magazines.json')
      .then(res => res.json())
      .then(data => setMagazines(data))
      .catch(err => console.error('Error fetching magazines:', err));
  }, []);

  return (
    <div id="gallery" className="py-24 relative">
      <div className="container mx-auto px-6">
        
        {/* SECTION 1: Magazine Publications Archive */}
        <div className="mb-28">
          <SectionHeader 
            number="04" 
            title="Publications" 
            subtitle="Annual Magazines" 
            icon={BookOpen}
          />

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 [perspective:1200px]">
            {magazines.map((mag, i) => (
              <motion.div
                key={mag.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedMagazine(mag)}
                className="group relative cursor-pointer bg-[#0e1613] border border-white/10 hover:border-valo-green/60 clip-path-valo transition-all duration-500 hover:-translate-y-2 hover:rotate-y-[-5deg] hover:shadow-[0_20px_40px_rgba(22,255,141,0.12)] flex flex-col"
              >
                {/* Magazine Cover with Book Spine Shadow on left */}
                <div className="relative aspect-[4/3] overflow-hidden bg-black/40">
                  {/* Spine depth shadow */}
                  <div className="absolute top-0 bottom-0 left-0 w-3 bg-gradient-to-r from-black/70 via-black/30 to-transparent z-10 pointer-events-none" />
                  <div className="absolute top-0 bottom-0 left-3 w-[1px] bg-white/10 z-10 pointer-events-none" />

                  <img 
                    src={mag.coverImage} 
                    alt={mag.title} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e1613] via-transparent to-transparent opacity-85 group-hover:opacity-40 transition-opacity" />
                  
                  {/* Badge */}
                  <div className="absolute top-4 left-4 bg-valo-bg/90 backdrop-blur-md px-3 py-1 border border-valo-green/40 clip-path-valo z-20">
                    <span className="font-mono text-xs uppercase tracking-widest text-valo-green font-bold">
                      {mag.year}
                    </span>
                  </div>

                  {/* Hover icon */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-valo-green text-valo-bg p-2 clip-path-valo z-20">
                    <FileText size={18} />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1 justify-between">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50 block mb-1">
                      {mag.edition}
                    </span>
                    <h3 className="text-xl font-display font-bold uppercase tracking-tight text-white group-hover:text-valo-green transition-colors mb-2">
                      {mag.title}
                    </h3>
                    {mag.description && (
                      <p className="text-sm font-sans text-gray-400 line-clamp-2 leading-relaxed">
                        {mag.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-valo-green flex items-center gap-1 group-hover:underline">
                      Read Magazine <ExternalLink size={13} className="inline" />
                    </span>
                    <span className="font-mono text-[10px] text-white/40 uppercase">PDF Edition</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* SECTION 2: Sector Logs / Visual Photo Gallery */}
        <div>
          <SectionHeader 
            number="05" 
            title="Sector Logs" 
            subtitle="Visual Archive" 
            icon={ImageIcon}
          />

          <div className="columns-3 sm:columns-2 lg:columns-3 gap-2 sm:gap-6 space-y-2 sm:space-y-6">
            {galleryImages.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedImage(img)}
                className="relative group cursor-pointer overflow-hidden clip-path-valo valo-border"
              >
                <img 
                  src={img} 
                  alt={`Gallery ${i}`} 
                  className="w-full h-auto grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-valo-green/0 group-hover:bg-valo-green/10 transition-colors" />
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-valo-bg/80 p-2 text-valo-green backdrop-blur-md">
                  <Expand size={20} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>

      {/* Magazine Preview Modal */}
      <AnimatePresence>
        {selectedMagazine && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8 bg-black/85 backdrop-blur-md"
            onClick={() => setSelectedMagazine(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-5xl h-[88vh] bg-[#0c1310] border border-valo-green/40 clip-path-valo shadow-2xl flex flex-col relative overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#111a15]">
                <div className="flex items-center gap-3">
                  <BookOpen size={20} className="text-valo-green" />
                  <div>
                    <h4 className="font-display font-bold uppercase tracking-wider text-base md:text-lg text-white">
                      {selectedMagazine.title} — <span className="text-valo-green">{selectedMagazine.year}</span>
                    </h4>
                    <span className="font-mono text-[10px] text-white/50 uppercase tracking-widest block">
                      {selectedMagazine.edition}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href={selectedMagazine.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 border border-white/20 hover:border-valo-green hover:text-valo-green transition-colors text-white"
                    title="Open in new window"
                  >
                    <ExternalLink size={18} />
                  </a>
                  <button 
                    onClick={() => setSelectedMagazine(null)}
                    className="p-2 border border-white/20 hover:border-valo-red hover:text-valo-red transition-colors text-white"
                    title="Close"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Modal Body / PDF Preview iframe */}
              <div className="flex-1 w-full h-full bg-[#16201b] relative">
                <iframe
                  src={selectedMagazine.pdfUrl}
                  title={`${selectedMagazine.title} PDF Preview`}
                  className="w-full h-full border-none"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gallery Image Fullscreen Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-valo-bg/98 backdrop-blur-xl"
            onClick={() => setSelectedImage(null)}
          >
            <button 
              className="absolute top-10 right-10 text-white hover:text-valo-green transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X size={40} />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={selectedImage}
              className="max-w-full max-h-full object-contain clip-path-valo valo-border"
              onClick={(e) => e.stopPropagation()}
              referrerPolicy="no-referrer"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
