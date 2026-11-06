import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, MapPin, Clock, X, Info } from 'lucide-react';
import { Event } from '../../types';
import { SectionHeader, ValoButton } from '../ui/Shared';

export const EventsSection: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [activeCategory, setActiveCategory] = useState<'past' | 'ongoing' | 'upcoming'>('upcoming');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    fetch('/data/events.json')
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(err => console.error('Error fetching events data:', err));
  }, []);

  const filteredEvents = events.filter(e => e.category === activeCategory);

  return (
    <section id="events" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <SectionHeader 
          number="06" 
          title="Active Missions" 
          subtitle="Events & Operations"
          icon={Calendar}
        />

        {/* Filters */}
        <div className="flex gap-4 mb-12 overflow-x-auto pb-4 scrollbar-hide">
          {(['upcoming', 'ongoing', 'past'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-8 py-3 font-display font-bold uppercase tracking-widest text-sm transition-all duration-300 clip-path-valo ${
                activeCategory === cat 
                  ? 'bg-valo-green text-valo-bg' 
                  : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event) => (
            <motion.div
              key={event.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -10 }}
              className="group cursor-pointer"
              onClick={() => setSelectedEvent(event)}
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
                <div className="absolute inset-x-0 bottom-0 p-8">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-valo-green" />
                    <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-valo-green">{event.date}</span>
                  </div>
                  <h3 className="text-3xl font-display font-bold uppercase tracking-tight leading-[0.85] mb-4">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-4 text-xs font-mono text-white/40">
                    <span className="flex items-center gap-1"><MapPin size={12} /> {event.location}</span>
                  </div>
                </div>

                {/* Hover Border Accent */}
                <div className="absolute inset-0 border-r-2 border-valo-green/0 group-hover:border-valo-green/50 transition-all" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedEvent && (
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
                        {selectedEvent.category}
                      </span>
                      <span className="font-mono text-[10px] tracking-widest text-white/40 uppercase">{selectedEvent.date}</span>
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
                          <p className="font-bold">{selectedEvent.time}</p>
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

                    {selectedEvent.category !== 'past' && (
                      <ValoButton className="w-full">Initialize Registration</ValoButton>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
