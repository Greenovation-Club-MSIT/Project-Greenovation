import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Image as ImageIcon, BookOpen, X, Expand, ExternalLink, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { SectionHeader } from '../ui/Shared';
import { PhotoStreamLoop } from '../ui/PhotoStreamLoop';
import { Magazine } from '../../types';
import { valoAudio } from '../../utils/audio';
import initialGalleryImages from 'virtual:gallery-images';

export const GallerySection: React.FC = () => {
  const [galleryImages, setGalleryImages] = useState<string[]>(initialGalleryImages || []);
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedMagazine, setSelectedMagazine] = useState<Magazine | null>(null);

  // Magazine Carousel State
  const [activeMagIndex, setActiveMagIndex] = useState(0);
  const [isAutoSlidePaused, setIsAutoSlidePaused] = useState(false);
  const isDraggingRef = useRef(false);

  // Responsive magazine carousel capacity
  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    const updateVisibleCount = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        setVisibleCount(3);
      } else if (width >= 640) {
        setVisibleCount(2);
      } else {
        setVisibleCount(1);
      }
    };

    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  const canSlide = magazines.length > visibleCount;
  const maxIndex = Math.max(0, magazines.length - visibleCount);
  const stepPercent = 100 / visibleCount;

  // Keep active index within bounds if window resizes
  useEffect(() => {
    if (activeMagIndex > maxIndex) {
      setActiveMagIndex(maxIndex);
    }
  }, [activeMagIndex, maxIndex]);

  // Touch/drag gesture state
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const isHorizontalSwipe = useRef<boolean | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || !canSlide) return;
    touchStartPos.current = { x: e.clientX, y: e.clientY };
    isHorizontalSwipe.current = null;
    isDraggingRef.current = false;
    setIsAutoSlidePaused(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!touchStartPos.current || !canSlide) return;

    const deltaX = e.clientX - touchStartPos.current.x;
    const deltaY = e.clientY - touchStartPos.current.y;

    if (isHorizontalSwipe.current === null) {
      if (Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6) {
        isHorizontalSwipe.current = Math.abs(deltaX) > Math.abs(deltaY);
        if (isHorizontalSwipe.current) {
          isDraggingRef.current = true;
          setIsDragging(true);
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch (_) {}
        }
      }
    }

    if (isHorizontalSwipe.current) {
      let offset = deltaX;
      // Elastic feel if at beginning and pulling right (trying to go previous)
      if (activeMagIndex === 0 && deltaX > 0) {
        offset = deltaX * 0.25;
      }
      // Elastic feel if at end and pulling left (trying to go next)
      else if (activeMagIndex === maxIndex && deltaX < 0) {
        offset = deltaX * 0.25;
      }

      setDragOffset(offset);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (touchStartPos.current) {
      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch (_) {}

      if (isDragging) {
        const threshold = 45;
        // Strictly non-wrapping finger slide: only advance within bounds [0, maxIndex]
        if (dragOffset < -threshold && activeMagIndex < maxIndex) {
          setActiveMagIndex((prev) => prev + 1);
        } else if (dragOffset > threshold && activeMagIndex > 0) {
          setActiveMagIndex((prev) => prev - 1);
        }
        // If boundary reached or threshold not met, it springs back smoothly to the active index
        setDragOffset(0);
        setIsDragging(false);
      }

      touchStartPos.current = null;
      isHorizontalSwipe.current = null;
      setTimeout(() => {
        isDraggingRef.current = false;
        setIsAutoSlidePaused(false);
      }, 150);
    }
  };

  const currentIndex = selectedImage ? galleryImages.indexOf(selectedImage) : -1;

  //Smooth carousel drag state
  const [dragX, setDragX] = useState(0);
  const [isModalDragging, setIsModalDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const lastDragXRef = useRef(0);
  const lastDragTimeRef = useRef(0);
  const dragVelocityRef = useRef(0);
  const isHorizontalSwipeRef = useRef<boolean | null>(null);

  const handleModalPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || galleryImages.length <= 1) return;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    lastDragXRef.current = e.clientX;
    lastDragTimeRef.current = Date.now();
    dragVelocityRef.current = 0;
    isHorizontalSwipeRef.current = null;
    setIsModalDragging(false);
  };

  const handleModalPointerMove = (e: React.PointerEvent) => {
    if (!dragStartRef.current) return;

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    if (isHorizontalSwipeRef.current === null) {
      if (Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6) {
        isHorizontalSwipeRef.current = Math.abs(deltaX) > Math.abs(deltaY);
        if (isHorizontalSwipeRef.current) {
          setIsModalDragging(true);
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch (_) {}
        }
      }
    }

    if (isHorizontalSwipeRef.current) {
      const now = Date.now();
      const dt = Math.max(1, now - lastDragTimeRef.current);
      const dx = e.clientX - lastDragXRef.current;
      dragVelocityRef.current = (dx / dt) * 16;
      lastDragXRef.current = e.clientX;
      lastDragTimeRef.current = now;

      let offset = deltaX;
      //Rubber band resistance at ends
      if (currentIndex === 0 && deltaX > 0) {
        offset = deltaX * 0.3;
      } else if (currentIndex === galleryImages.length - 1 && deltaX < 0) {
        offset = deltaX * 0.3;
      }

      setDragX(offset);
    }
  };

  const handleModalPointerUp = (e: React.PointerEvent) => {
    if (!dragStartRef.current) return;

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch (_) {}

    if (isModalDragging && isHorizontalSwipeRef.current) {
      const threshold = 45;
      const velocityThreshold = 3.5;
      const currentVel = dragVelocityRef.current;

      // Swiped Left -> advance to next photo
      if ((dragX < -threshold || currentVel < -velocityThreshold) && currentIndex < galleryImages.length - 1) {
        setSelectedImage(galleryImages[currentIndex + 1]);
      } 
      // Swiped Right -> return to previous photo
      else if ((dragX > threshold || currentVel > velocityThreshold) && currentIndex > 0) {
        setSelectedImage(galleryImages[currentIndex - 1]);
      }

      setDragX(0);
      setIsModalDragging(false);
    }

    dragStartRef.current = null;
    isHorizontalSwipeRef.current = null;
  };

  const handlePrevImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentIndex <= 0) return;
    valoAudio.playClick();
    setSelectedImage(galleryImages[currentIndex - 1]);
  };

  const handleNextImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentIndex >= galleryImages.length - 1) return;
    valoAudio.playClick();
    setSelectedImage(galleryImages[currentIndex + 1]);
  };

  // Magazine Carousel Handlers
  const handlePrevMag = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!canSlide) return;
    valoAudio.playClick();
    setActiveMagIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleNextMag = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!canSlide) return;
    valoAudio.playClick();
    setActiveMagIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  // Auto slide magazines every 4.5 seconds when screen cannot show all at once
  useEffect(() => {
    if (!canSlide || selectedMagazine || isAutoSlidePaused) return;

    const interval = setInterval(() => {
      setActiveMagIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 4500);

    return () => clearInterval(interval);
  }, [canSlide, maxIndex, selectedMagazine, isAutoSlidePaused]);

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

  const renderMagazineCard = (mag: Magazine) => (
    <div
      onClick={() => {
        if (isDraggingRef.current) return;
        // On mobile view (< 640px / touch-friendly screen), directly open PDF in a new tab/window
        if (window.innerWidth < 640) {
          window.open(mag.pdfUrl, '_blank', 'noopener,noreferrer');
          return;
        }
        setSelectedMagazine(mag);
      }}
      className="group relative cursor-pointer bg-[#0e1613] border border-white/10 hover:border-valo-green/60 clip-path-valo transition-all duration-500 hover:-translate-y-2 hover:rotate-y-[-5deg] hover:shadow-[0_20px_40px_rgba(22,255,141,0.12)] flex flex-col h-full select-none"
    >
      {/* Magazine Cover */}
      <div className="relative aspect-[3/4] overflow-hidden bg-black/40">
        <img 
          src={mag.coverImage} 
          alt={mag.title} 
          className="w-full h-full object-cover object-top transition-all duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        
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
      <div className="p-6 flex flex-col flex-1 justify-between min-h-[190px]">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50 block mb-1 truncate">
            {mag.edition}
          </span>
          <h3 className="text-xl font-display font-bold uppercase tracking-tight text-white group-hover:text-valo-green transition-colors mb-2 line-clamp-2 h-14">
            {mag.title}
          </h3>
          {mag.description && (
            <p className="text-sm font-sans text-gray-400 line-clamp-2 leading-relaxed h-10">
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
    </div>
  );

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

          {/* Universal Responsive Magazine Showcase: Phone, Tablet, PC & Large Displays */}
          <div 
            className="relative w-full max-w-sm sm:max-w-none mx-auto"
            onTouchStart={() => setIsAutoSlidePaused(true)}
            onTouchEnd={() => setTimeout(() => setIsAutoSlidePaused(false), 4000)}
            onMouseEnter={() => setIsAutoSlidePaused(true)}
            onMouseLeave={() => setIsAutoSlidePaused(false)}
          >
            {magazines.length > 0 && (
              <div className="relative">
                {/* Horizontal sliding track */}
                <div 
                  className={`overflow-hidden w-full ${canSlide ? 'touch-pan-y cursor-grab active:cursor-grabbing select-none' : ''}`}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                >
                  <motion.div
                    className="flex -mx-2 sm:-mx-3 lg:-mx-4"
                    animate={{
                      x: canSlide 
                        ? `calc(-${activeMagIndex * stepPercent}% + ${dragOffset}px)`
                        : '0%'
                    }}
                    transition={
                      isDragging
                        ? { duration: 0, ease: 'linear' }
                        : { type: 'spring', stiffness: 300, damping: 30 }
                    }
                  >
                    {magazines.map((mag) => (
                      <div 
                        key={mag.id} 
                        className="w-full sm:w-1/2 lg:w-1/3 shrink-0 px-2 sm:px-3 lg:px-4"
                      >
                        {renderMagazineCard(mag)}
                      </div>
                    ))}
                  </motion.div>
                </div>

                {/* Left & Right Navigation Arrows (shown whenever screen cannot handle all magazines horizontally) */}
                {canSlide && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevMag}
                      aria-label="Previous Magazine"
                      className="absolute left-1 sm:-left-5 lg:-left-6 top-[38%] -translate-y-1/2 z-30 w-11 h-11 lg:w-12 lg:h-12 flex items-center justify-center bg-black/75 border border-valo-green/40 text-valo-green/80 backdrop-blur-md clip-path-valo shadow-[0_0_15px_rgba(22,255,141,0.2)] opacity-70 hover:opacity-100 active:opacity-100 hover:text-black hover:bg-valo-green hover:border-valo-green active:scale-90 transition-all duration-300 cursor-pointer select-none"
                    >
                      <ChevronLeft size={24} />
                    </button>

                    <button
                      type="button"
                      onClick={handleNextMag}
                      aria-label="Next Magazine"
                      className="absolute right-1 sm:-right-5 lg:-right-6 top-[38%] -translate-y-1/2 z-30 w-11 h-11 lg:w-12 lg:h-12 flex items-center justify-center bg-black/75 border border-valo-green/40 text-valo-green/80 backdrop-blur-md clip-path-valo shadow-[0_0_15px_rgba(22,255,141,0.2)] opacity-70 hover:opacity-100 active:opacity-100 hover:text-black hover:bg-valo-green hover:border-valo-green active:scale-90 transition-all duration-300 cursor-pointer select-none"
                    >
                      <ChevronRight size={24} />
                    </button>

                    {/* Progress indicators and counter */}
                    <div className="mt-6 flex items-center justify-between px-2">
                      <div className="flex items-center gap-2">
                        {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              valoAudio.playClick();
                              setActiveMagIndex(idx);
                            }}
                            aria-label={`Go to slide ${idx + 1}`}
                            className={`h-1.5 transition-all duration-300 ${
                              idx === activeMagIndex 
                                ? 'w-8 bg-valo-green shadow-[0_0_10px_rgba(22,255,141,0.5)]' 
                                : 'w-2.5 bg-white/20 hover:bg-white/40'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="font-mono text-xs text-white/50 tracking-widest uppercase flex items-center gap-1.5">
                        <span>DISPATCH</span>
                        <span className="text-valo-green font-bold">{String(activeMagIndex + 1).padStart(2, '0')}</span>
                        <span>/</span>
                        <span>{String(maxIndex + 1).padStart(2, '0')}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
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

          {/* Continuous Left-to-Right Flowing Photo Loop with Fling Acceleration */}
          <PhotoStreamLoop
            images={galleryImages}
            onSelectImage={setSelectedImage}
            isPausedModal={Boolean(selectedImage)}
          />
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

      {/* Gallery Image Fullscreen Modal with Instagram-Style Smooth Carousel */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-0 sm:p-6 bg-valo-bg/95 backdrop-blur-xl select-none"
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
            {currentIndex > 0 && (
              <button
                onClick={handlePrevImage}
                aria-label="Previous photo"
                className="absolute left-3 sm:left-8 top-1/2 -translate-y-1/2 z-[220] p-3 sm:p-4 bg-[#0e1613]/85 hover:bg-valo-green text-white hover:text-valo-bg border border-valo-green/30 hover:border-valo-green clip-path-valo transition-all duration-300 shadow-2xl hover:scale-110 active:scale-95 cursor-pointer group"
              >
                <ChevronLeft size={28} className="transition-transform group-hover:-translate-x-0.5" />
              </button>
            )}

            {/* Center Carousel Track Container */}
            <div 
              className="relative max-w-5xl w-full h-[75vh] sm:h-[82vh] flex items-center justify-center overflow-hidden touch-none"
              onPointerDown={handleModalPointerDown}
              onPointerMove={handleModalPointerMove}
              onPointerUp={handleModalPointerUp}
              onPointerCancel={handleModalPointerUp}
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                className="flex flex-row w-full h-full"
                style={{
                  transform: `translate3d(calc(-${currentIndex * 100}% + ${dragX}px), 0px, 0px)`,
                  transition: isModalDragging ? 'none' : 'transform 0.32s cubic-bezier(0.2, 0.9, 0.3, 1)',
                  willChange: 'transform'
                }}
              >
                {galleryImages.map((img, idx) => (
                  <div 
                    key={idx}
                    className="w-full h-full flex-shrink-0 flex items-center justify-center p-2 sm:p-4 cursor-grab active:cursor-grabbing"
                  >
                    <img
                      src={img}
                      alt={`Gallery photo ${idx + 1}`}
                      className="max-w-full max-h-full w-auto h-auto object-contain clip-path-valo border border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.8)] pointer-events-none select-none"
                      referrerPolicy="no-referrer"
                      draggable={false}
                      loading={Math.abs(idx - currentIndex) <= 2 ? 'eager' : 'lazy'}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Right Traverse Arrow */}
            {currentIndex < galleryImages.length - 1 && (
              <button
                onClick={handleNextImage}
                aria-label="Next photo"
                className="absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 z-[220] p-3 sm:p-4 bg-[#0e1613]/85 hover:bg-valo-green text-white hover:text-valo-bg border border-valo-green/30 hover:border-valo-green clip-path-valo transition-all duration-300 shadow-2xl hover:scale-110 active:scale-95 cursor-pointer group"
              >
                <ChevronRight size={28} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
