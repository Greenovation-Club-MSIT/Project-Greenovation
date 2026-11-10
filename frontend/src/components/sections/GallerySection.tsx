import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Image as ImageIcon, BookOpen, X, Expand, ExternalLink, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { SectionHeader } from '../ui/Shared';
import { Magazine } from '../../types';
import { valoAudio } from '../../utils/audio';
import initialGalleryImages from 'virtual:gallery-images';

export const GallerySection: React.FC = () => {
  const [galleryImages, setGalleryImages] = useState<string[]>(initialGalleryImages || []);
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedMagazine, setSelectedMagazine] = useState<Magazine | null>(null);

  const currentIndex = selectedImage ? galleryImages.indexOf(selectedImage) : -1;

  const handlePrevImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (galleryImages.length === 0) return;
    valoAudio.playClick();
    const nextIdx = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
    setSelectedImage(galleryImages[nextIdx]);
  };

  const handleNextImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (galleryImages.length === 0) return;
    valoAudio.playClick();
    const nextIdx = (currentIndex + 1) % galleryImages.length;
    setSelectedImage(galleryImages[nextIdx]);
  };

  useEffect(() => {
    if (!selectedImage) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevImage();
      } else if (e.key === 'ArrowRight') {
        handleNextImage();
      } else if (e.key === 'Escape') {
        setSelectedImage(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, galleryImages, currentIndex]);

  useEffect(() => {
    fetch('/data/gallery.json')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setGalleryImages(data);
        }
      })
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
            number="05" 
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
            number="06" 
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
                className="relative group cursor-pointer overflow-hidden clip-path-valo valo-border bg-[#0b1411] transition-all duration-500 hover:shadow-[0_0_25px_rgba(22,255,141,0.25)] hover:border-valo-green"
              >
                {/* Full color image with smooth hover zoom & vibrant enhancement */}
                <img 
                  src={img} 
                  alt={`Gallery ${i}`} 
                  className="w-full h-auto object-cover transition-all duration-700 group-hover:scale-105 group-hover:contrast-105"
                  referrerPolicy="no-referrer"
                />

                {/* Cyber HUD Tactical Crosshairs at Corners */}
                <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t-2 border-l-2 border-valo-green/40 group-hover:border-valo-green transition-colors pointer-events-none" />
                <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t-2 border-r-2 border-valo-green/40 group-hover:border-valo-green transition-colors pointer-events-none" />
                <div className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b-2 border-l-2 border-valo-green/40 group-hover:border-valo-green transition-colors pointer-events-none" />
                <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b-2 border-r-2 border-valo-green/40 group-hover:border-valo-green transition-colors pointer-events-none" />

                {/* Animated Sci-Fi Scanline on Hover */}
                <div className="absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-valo-green/20 to-transparent -translate-y-full group-hover:translate-y-[450%] transition-transform duration-1000 ease-in-out pointer-events-none" />

                {/* Ambient Bottom Gradient Bar with Mission Telemetry */}
                <div className="absolute inset-0 bg-gradient-to-t from-valo-bg/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex items-end justify-between p-3">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-valo-green font-bold drop-shadow">
                    REC // 0{i + 1}
                  </span>
                  <div className="bg-valo-bg/90 border border-valo-green/40 p-1.5 text-valo-green backdrop-blur-md clip-path-valo">
                    <Expand size={16} />
                  </div>
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

      {/* Gallery Image Fullscreen Modal with Left/Right Navigation */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8 bg-valo-bg/95 backdrop-blur-xl select-none"
            onClick={() => setSelectedImage(null)}
          >
            {/* Top Bar HUD / Close button */}
            <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-[220] pointer-events-none">
              <div className="font-mono text-xs uppercase tracking-widest text-valo-green bg-[#0e1613]/90 border border-valo-green/30 px-3 py-1.5 clip-path-valo">
                SECTOR ARCHIVE // {String(currentIndex + 1).padStart(2, '0')} OF {String(galleryImages.length).padStart(2, '0')}
              </div>
              <button 
                className="pointer-events-auto bg-[#0e1613]/80 hover:bg-valo-red text-white p-2.5 clip-path-valo border border-white/10 hover:border-valo-red transition-all duration-200 cursor-pointer"
                onClick={() => setSelectedImage(null)}
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>

            {/* Left Traverse Arrow */}
            {galleryImages.length > 1 && (
              <button
                onClick={handlePrevImage}
                aria-label="Previous photo"
                className="absolute left-3 sm:left-8 top-1/2 -translate-y-1/2 z-[220] p-3 sm:p-4 bg-[#0e1613]/85 hover:bg-valo-green text-white hover:text-valo-bg border border-valo-green/30 hover:border-valo-green clip-path-valo transition-all duration-300 shadow-2xl hover:scale-110 active:scale-95 cursor-pointer group"
              >
                <ChevronLeft size={28} className="transition-transform group-hover:-translate-x-0.5" />
              </button>
            )}

            {/* Center Photo Display */}
            <div 
              className="relative max-w-5xl max-h-[82vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  src={selectedImage}
                  className="max-w-full max-h-[80vh] w-auto h-auto object-contain clip-path-valo border border-valo-green/30 shadow-[0_0_50px_rgba(0,0,0,0.8)]"
                  referrerPolicy="no-referrer"
                />
              </AnimatePresence>
            </div>

            {/* Right Traverse Arrow */}
            {galleryImages.length > 1 && (
              <button
                onClick={handleNextImage}
                aria-label="Next photo"
                className="absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 z-[220] p-3 sm:p-4 bg-[#0e1613]/85 hover:bg-valo-green text-white hover:text-valo-bg border border-valo-green/30 hover:border-valo-green clip-path-valo transition-all duration-300 shadow-2xl hover:scale-110 active:scale-95 cursor-pointer group"
              >
                <ChevronRight size={28} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            )}

            {/* Bottom Keyboard hint */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[220] pointer-events-none hidden sm:flex items-center gap-3 font-mono text-[10px] tracking-widest text-white/40 uppercase">
              <span>&#x2190; PREV</span>
              <span>•</span>
              <span>ESC TO CLOSE</span>
              <span>•</span>
              <span>NEXT &#x2192;</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
