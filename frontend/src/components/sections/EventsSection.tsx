import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, MapPin, Clock, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Event } from '../../types';
import { SectionHeader, ValoButton } from '../ui/Shared';
import { valoAudio } from '../../utils/audio';

const toMilliseconds = (timestamp: number): number => {
  return timestamp < 10000000000 ? timestamp * 1000 : timestamp;
};

const getEventCategory = (event: Event, nowMs: number): 'past' | 'ongoing' | 'upcoming' => {
  const startMs = toMilliseconds(event.startTime);
  const endMs = toMilliseconds(event.endTime);

  if (nowMs < startMs) {
    return 'upcoming';
  } else if (nowMs <= endMs) {
    return 'ongoing';
  } else {
    return 'past';
  }
};

const formatEventDate = (startTime: number, endTime?: number): string => {
  const start = new Date(toMilliseconds(startTime));
  const startStr = start.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  if (!endTime) return startStr;
  const end = new Date(toMilliseconds(endTime));
  if (start.toDateString() === end.toDateString()) return startStr;
  const endStr = end.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  return `${startStr} - ${endStr}`;
};

const formatEventTime = (startTime: number, endTime?: number): string => {
  const startStr = new Date(toMilliseconds(startTime)).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
  if (!endTime) return startStr;
  const endStr = new Date(toMilliseconds(endTime)).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
  return `${startStr} - ${endStr}`;
};

export const EventsSection: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [activeCategory, setActiveCategory] = useState<'past' | 'ongoing' | 'upcoming'>('upcoming');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Phone view horizontal carousel state (same mechanic as magazines)
  const [activeEventIndex, setActiveEventIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAutoSlidePaused, setIsAutoSlidePaused] = useState(false);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const isHorizontalSwipe = useRef<boolean | null>(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    fetch('/data/events.json')
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(err => console.error('Error fetching events data:', err));

    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredEvents = events
    .filter(e => getEventCategory(e, currentTime) === activeCategory)
    .sort((a, b) => {
      if (activeCategory === 'past') {
        // Latest (most recent) past event first
        return toMilliseconds(b.startTime) - toMilliseconds(a.startTime);
      }
      // For upcoming and ongoing, soonest event first
      return toMilliseconds(a.startTime) - toMilliseconds(b.startTime);
    });

  // Reset active index when category changes or bounds shift
  useEffect(() => {
    setActiveEventIndex(0);
    setDragOffset(0);
  }, [activeCategory]);

  const maxEventIndex = Math.max(0, filteredEvents.length - 1);
  useEffect(() => {
    if (activeEventIndex > maxEventIndex) {
      setActiveEventIndex(maxEventIndex);
    }
  }, [activeEventIndex, maxEventIndex]);

  const canSlideEvents = filteredEvents.length > 1;

  // Auto slide events every 4.5 seconds just like magazines
  useEffect(() => {
    if (!canSlideEvents || selectedEvent || isAutoSlidePaused) return;

    const interval = setInterval(() => {
      setActiveEventIndex((prev) => (prev >= maxEventIndex ? 0 : prev + 1));
    }, 4500);

    return () => clearInterval(interval);
  }, [canSlideEvents, maxEventIndex, selectedEvent, isAutoSlidePaused]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || !canSlideEvents) return;
    touchStartPos.current = { x: e.clientX, y: e.clientY };
    isHorizontalSwipe.current = null;
    isDraggingRef.current = false;
    setIsAutoSlidePaused(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!touchStartPos.current || !canSlideEvents) return;

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
      // Elastic feel at boundaries
      if (activeEventIndex === 0 && deltaX > 0) {
        offset = deltaX * 0.25;
      } else if (activeEventIndex === maxEventIndex && deltaX < 0) {
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
        if (dragOffset < -threshold && activeEventIndex < maxEventIndex) {
          setActiveEventIndex((prev) => prev + 1);
        } else if (dragOffset > threshold && activeEventIndex > 0) {
          setActiveEventIndex((prev) => prev - 1);
        }
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

  const handlePrevEvent = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!canSlideEvents) return;
    valoAudio.playClick();
    setActiveEventIndex((prev) => (prev <= 0 ? maxEventIndex : prev - 1));
  };

  const handleNextEvent = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!canSlideEvents) return;
    valoAudio.playClick();
    setActiveEventIndex((prev) => (prev >= maxEventIndex ? 0 : prev + 1));
  };

  const renderEventCard = (event: Event) => {
    const dateStr = formatEventDate(event.startTime, event.endTime);
    return (
      <div
        className="group cursor-pointer w-full select-none"
        onClick={() => {
          if (isDraggingRef.current) return;
          setSelectedEvent(event);
        }}
      >
        <div className="relative aspect-[4/5] overflow-hidden clip-path-valo bg-valo-dark">
          <img 
            src={event.image} 
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-valo-bg via-transparent to-transparent opacity-80" />
          
          {/* Content Overlay */}
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-valo-green" />
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-valo-green">{dateStr}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-display font-bold uppercase tracking-tight leading-[0.85] mb-4">
              {event.title}
            </h3>
            <div className="flex items-center gap-4 text-xs font-mono text-white/40">
              <span className="flex items-center gap-1"><MapPin size={12} /> {event.location}</span>
            </div>
          </div>

          {/* Hover Border Accent */}
          <div className="absolute inset-0 border-r-2 border-valo-green/0 group-hover:border-valo-green/50 transition-all" />
        </div>
      </div>
    );
  };

  return (
    <section id="events" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <SectionHeader 
          number="07" 
          title="Active Missions" 
          subtitle="Events & Operations"
          icon={Calendar}
        />

        {/* Filters */}
        <div className="flex gap-2 sm:gap-4 mb-8 sm:mb-12 overflow-x-auto pb-2 scrollbar-hide justify-center sm:justify-start">
          {(['upcoming', 'ongoing', 'past'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                valoAudio.playClick();
                setActiveCategory(cat);
              }}
              className={`px-4 py-2 sm:px-8 sm:py-3 font-display font-bold uppercase tracking-wider sm:tracking-widest text-xs sm:text-sm transition-all duration-300 clip-path-valo shrink-0 ${
                activeCategory === cat 
                  ? 'bg-valo-green text-valo-bg' 
                  : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Content */}
        {filteredEvents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 px-6 text-center border border-dashed border-white/10 clip-path-valo bg-valo-dark/30"
          >
            <Calendar className="w-12 h-12 text-valo-green/30 mb-4" />
            <h4 className="text-xl md:text-2xl font-display font-bold uppercase tracking-widest text-white/70">
              No {activeCategory} events
            </h4>
            <p className="mt-2 text-xs md:text-sm font-mono text-white/40 tracking-wider uppercase">
              Check back later or explore other mission timelines.
            </p>
          </motion.div>
        ) : (
          <>
            {/* Desktop / Tablet Grid View (>= md) */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event) => (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -10 }}
                >
                  {renderEventCard(event)}
                </motion.div>
              ))}
            </div>

            {/* Phone View: Horizontal Sliding Carousel with Drag & Nav Buttons (Same mechanic as magazines) */}
            <div 
              className="block md:hidden relative w-full max-w-sm mx-auto"
              onTouchStart={() => setIsAutoSlidePaused(true)}
              onTouchEnd={() => setTimeout(() => setIsAutoSlidePaused(false), 4000)}
              onMouseEnter={() => setIsAutoSlidePaused(true)}
              onMouseLeave={() => setIsAutoSlidePaused(false)}
            >
              <div className="relative">
                {/* Horizontal sliding track */}
                <div 
                  className={`overflow-hidden w-full ${canSlideEvents ? 'touch-pan-y cursor-grab active:cursor-grabbing select-none' : ''}`}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                >
                  <motion.div
                    className="flex -mx-2"
                    animate={{
                      x: canSlideEvents 
                        ? `calc(-${activeEventIndex * 100}% + ${dragOffset}px)`
                        : '0%'
                    }}
                    transition={
                      isDragging
                        ? { duration: 0, ease: 'linear' }
                        : { type: 'spring', stiffness: 300, damping: 30 }
                    }
                  >
                    {filteredEvents.map((event) => (
                      <div 
                        key={event.id} 
                        className="w-full shrink-0 px-2"
                      >
                        {renderEventCard(event)}
                      </div>
                    ))}
                  </motion.div>
                </div>

                {/* Left & Right Navigation Arrows */}
                {canSlideEvents && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevEvent}
                      aria-label="Previous Event"
                      className="absolute left-1 top-[42%] -translate-y-1/2 z-30 w-11 h-11 flex items-center justify-center bg-black/75 border border-valo-green/40 text-valo-green/80 backdrop-blur-md clip-path-valo shadow-[0_0_15px_rgba(22,255,141,0.2)] opacity-70 hover:opacity-100 active:opacity-100 hover:text-black hover:bg-valo-green hover:border-valo-green active:scale-90 transition-all duration-300 cursor-pointer select-none"
                    >
                      <ChevronLeft size={24} />
                    </button>

                    <button
                      type="button"
                      onClick={handleNextEvent}
                      aria-label="Next Event"
                      className="absolute right-1 top-[42%] -translate-y-1/2 z-30 w-11 h-11 flex items-center justify-center bg-black/75 border border-valo-green/40 text-valo-green/80 backdrop-blur-md clip-path-valo shadow-[0_0_15px_rgba(22,255,141,0.2)] opacity-70 hover:opacity-100 active:opacity-100 hover:text-black hover:bg-valo-green hover:border-valo-green active:scale-90 transition-all duration-300 cursor-pointer select-none"
                    >
                      <ChevronRight size={24} />
                    </button>

                    {/* Progress indicators and counter */}
                    <div className="mt-6 flex items-center justify-between px-2">
                      <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-[65%] scrollbar-hide">
                        {filteredEvents.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              valoAudio.playClick();
                              setActiveEventIndex(idx);
                            }}
                            aria-label={`Go to event ${idx + 1}`}
                            className={`h-1.5 transition-all duration-300 shrink-0 ${
                              idx === activeEventIndex 
                                ? 'w-7 bg-valo-green shadow-[0_0_10px_rgba(22,255,141,0.5)]' 
                                : 'w-2 bg-white/20 hover:bg-white/40'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="font-mono text-xs text-white/50 tracking-widest uppercase flex items-center gap-1.5">
                        <span>MISSION</span>
                        <span className="text-valo-green font-bold">{String(activeEventIndex + 1).padStart(2, '0')}</span>
                        <span>/</span>
                        <span>{String(filteredEvents.length).padStart(2, '0')}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedEvent && (() => {
          const selectedCat = getEventCategory(selectedEvent, currentTime);
          const dateStr = formatEventDate(selectedEvent.startTime, selectedEvent.endTime);
          const timeStr = formatEventTime(selectedEvent.startTime, selectedEvent.endTime);
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-valo-bg/95 backdrop-blur-sm"
              onClick={() => setSelectedEvent(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                className="bg-valo-dark max-w-4xl w-full max-h-[90vh] overflow-y-auto clip-path-valo valo-border p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative">
                  <button 
                    onClick={() => setSelectedEvent(null)}
                    className="absolute top-6 right-6 z-10 bg-valo-bg/50 p-2 hover:bg-valo-red hover:text-white transition-colors"
                  >
                    <X />
                  </button>
                  <div className="grid md:grid-cols-2">
                    <div className="h-64 md:h-auto">
                      <img src={selectedEvent.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="p-8 md:p-12">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="bg-valo-green text-valo-bg px-3 py-1 text-[10px] font-mono tracking-widest font-bold uppercase clip-path-valo">
                          {selectedCat}
                        </span>
                        <span className="font-mono text-[10px] tracking-widest text-white/40 uppercase">{dateStr}</span>
                      </div>
                      <h2 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tight mb-6 leading-none">
                        {selectedEvent.title}
                      </h2>
                      <p className="text-gray-400 mb-8 leading-relaxed">
                        {selectedEvent.longDescription}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-6 mb-10 pt-6 border-t border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="bg-valo-green/10 p-2 text-valo-green"><Clock size={20} /></div>
                          <div>
                            <p className="text-[10px] font-mono uppercase text-white/40">Launch Time</p>
                            <p className="font-bold">{timeStr}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="bg-valo-green/10 p-2 text-valo-green"><MapPin size={20} /></div>
                          <div>
                            <p className="text-[10px] font-mono uppercase text-white/40">Coordinates</p>
                            <p className="font-bold">{selectedEvent.location}</p>
                          </div>
                        </div>
                      </div>

                      {selectedCat !== 'past' && (
                        <ValoButton className="w-full">Initialize Registration</ValoButton>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </section>
  );
};
