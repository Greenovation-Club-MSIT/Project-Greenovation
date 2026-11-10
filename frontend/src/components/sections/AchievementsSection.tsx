import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from 'motion/react';
import { 
  Trophy, Award, Globe, Star, ChevronDown, ChevronUp, 
  ExternalLink, X, Shield, Eye, Calendar, Clock
} from 'lucide-react';
import { Achievement, SubEvent } from '../../types';
import { SectionHeader, ValoButton } from '../ui/Shared';
import { valoAudio } from '../../utils/audio';



// Unified structure for the Dossier Modal
interface DossierData {
  title: string;
  dateOrYear: string;
  description: string;
  image?: string;
  link?: string;
  typeLabel: string;
  longDescription?: string;
}

interface TimelineRowProps {
  ach: Achievement;
  i: number;
  total: number;
  hoveredCardId: string | null;
  setHoveredCardId: (id: string | null) => void;
  isExpanded: boolean;
  onToggle: () => void;
  onCardClick: (ach: Achievement) => void;
  onSubEventClick: (sub: SubEvent, ach: Achievement) => void;
  iconMap: Record<string, any>;
}

// Sub-component to safely render timeline row with viewport-triggered animation and scroll-synced paths
const TimelineRow: React.FC<TimelineRowProps> = ({
  ach,
  i,
  total,
  hoveredCardId,
  setHoveredCardId,
  isExpanded,
  onToggle,
  onCardClick,
  onSubEventClick,
  iconMap
}) => {
  const [hoveredSubId, setHoveredSubId] = useState<string | null>(null);
  const Icon = iconMap[ach.icon] || Star;
  const isEven = i % 2 === 0;
  const showLines = i < total - 1;

  const rowRef = useRef<HTMLDivElement>(null);
  
  // Track scroll position of this row container
  const { scrollYProgress } = useScroll({
    target: rowRef,
    offset: ["start 60%", "end 60%"]
  });

  // Smooth the scroll progress curve
  const springProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 25,
    restDelta: 0.001
  });

  // Map progress to local path segments
  const nodeScale = useTransform(springProgress, [0, 0.05], [0, 1], { clamp: true });
  const scaleX = useTransform(springProgress, [0.05, 0.2], [0, 1], { clamp: true });
  const scaleY = useTransform(springProgress, [0.2, 1.0], [0, 1], { clamp: true });
  const cardOpacity = useTransform(springProgress, [0.05, 0.25], [0, 1], { clamp: true });
  const cardY = useTransform(springProgress, [0.05, 0.25], [30, 0], { clamp: true });
  const cardScale = useTransform(springProgress, [0.05, 0.25], [0.97, 1], { clamp: true });

  return (
    <div
      ref={rowRef}
      className={`relative flex flex-col md:flex-row ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-start justify-between pb-16 md:pb-32 last:pb-0`}
    >
      
      {/* DESKTOP ONLY: Horizontal Winding Path Track */}
      {showLines && (
        <div className="absolute top-[48px] left-[32%] right-[32%] h-[2px] bg-white/5 hidden md:block z-0" />
      )}
      
      {/* DESKTOP ONLY: Horizontal Winding Path Active */}
      {showLines && (
        <motion.div 
          style={{ 
            scaleX,
            transformOrigin: isEven ? 'left' : 'right' 
          }}
          className="absolute top-[48px] left-[32%] right-[32%] h-[2px] bg-valo-green hidden md:block z-0"
        />
      )}

      {/* DESKTOP & MOBILE: Vertical Connection Path Track */}
      {showLines && (
        <div 
          className={`absolute top-[48px] w-[2px] bg-white/5 z-0 h-full ${
            isEven 
              ? 'left-8 md:left-auto md:right-[32%]' 
              : 'left-8 md:left-[32%] md:right-auto'
          }`}
        />
      )}

      {/* DESKTOP & MOBILE: Vertical Connection Path Active */}
      {showLines && (
        <motion.div 
          style={{ 
            scaleY,
            transformOrigin: 'top' 
          }}
          className={`absolute top-[48px] w-[2px] bg-valo-green z-0 h-full ${
            isEven 
              ? 'left-8 md:left-auto md:right-[32%]' 
              : 'left-8 md:left-[32%] md:right-auto'
          }`}
        />
      )}
      
      {/* Milestone Node Dot (Mobile layout) */}
      <motion.div 
        style={{ scale: nodeScale }}
        className="absolute left-8 -translate-x-1/2 -translate-y-1/2 flex md:hidden items-center justify-center z-20 top-[48px]"
      >
        <div 
          className={`w-8 h-8 rounded-full bg-valo-bg border flex items-center justify-center transition-all duration-300 ${
            hoveredCardId === ach.id 
              ? 'border-valo-green shadow-[0_0_15px_rgba(22,255,141,0.5)] scale-110' 
              : 'border-valo-green/30'
          }`}
        >
          <div className="absolute inset-0 rounded-full border border-valo-green/20 animate-ping opacity-30" />
          <div className="w-3.5 h-3.5 bg-valo-green rotate-45" />
        </div>
      </motion.div>

      {/* Milestone Node Dot (Desktop layout - centered on boundary to completely avoid overlapping text) */}
      <motion.div 
        style={{ scale: nodeScale }}
        className={`absolute top-[48px] -translate-y-1/2 -translate-x-1/2 z-20 hidden md:flex items-center justify-center ${
          isEven ? 'left-[32%]' : 'left-[68%]'
        }`}
      >
        <div 
          className={`w-8 h-8 rounded-full bg-valo-bg border flex items-center justify-center transition-all duration-300 ${
            hoveredCardId === ach.id 
              ? 'border-valo-green shadow-[0_0_15px_rgba(22,255,141,0.5)] scale-110' 
              : 'border-valo-green/30'
          }`}
        >
          <div className={`absolute inset-0 rounded-full border border-valo-green/20 animate-ping opacity-30 ${hoveredCardId === ach.id ? 'opacity-70' : ''}`} />
          <div className={`w-3.5 h-3.5 bg-valo-green rotate-45 transition-transform duration-300 ${hoveredCardId === ach.id ? 'scale-125 rotate-90' : ''}`} />
        </div>
      </motion.div>

      {/* Card Block */}
      <motion.div 
        style={{ opacity: cardOpacity, y: cardY, scale: cardScale }}
        className="w-full md:w-[32%] pl-16 md:pl-0"
      >
        {ach.type === 'grouped' ? (
          /* Operational Node Component: Enhanced prominence visual scale */
          <div 
            className="relative cursor-pointer w-full group"
            onMouseEnter={() => {
              valoAudio.playHover();
              setHoveredCardId(ach.id);
            }}
            onMouseLeave={() => setHoveredCardId(null)}
            onClick={() => onCardClick(ach)}
          >
            <div 
              className={`p-6 md:p-8 bg-valo-dark/45 hover:bg-valo-dark/70 border clip-path-valo transition-all duration-500 shadow-2xl ${
                hoveredCardId === ach.id 
                  ? 'border-valo-green/45 shadow-[0_0_30px_rgba(22,255,141,0.08)]' 
                  : 'border-valo-green/20'
              }`}
            >
              {/* Glowing Accent strip on the left (works seamlessly with clip-path-valo) */}
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-valo-green group-hover:bg-white transition-colors" />
              
              {/* Scanlines layer */}
              <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_bottom,rgba(22,255,141,0.05)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />

              {/* Top HUD bar */}
              <div className="flex justify-between items-center mb-6 pl-2">
                <span className="font-mono text-[11px] text-valo-green bg-valo-green/10 border border-valo-green/25 px-3 py-0.5 clip-path-valo uppercase tracking-widest font-semibold">
                  {ach.year}
                </span>
                <span className="font-mono text-[9px] text-valo-green/70 uppercase tracking-widest font-bold">
                  // OPERATIONAL_NODE
                </span>
              </div>

              {/* Main Content */}
              <div className="flex items-start gap-4 pl-2">
                <div className="bg-valo-green/10 w-12 h-12 flex items-center justify-center clip-path-valo border border-valo-green/30 group-hover:bg-valo-green group-hover:border-valo-green group-hover:text-valo-bg transition-all duration-300 flex-shrink-0">
                  <Icon size={24} className="text-valo-green group-hover:text-valo-bg transition-colors" />
                </div>
                
                <div>
                  <div className="flex items-center gap-1.5 text-valo-green/60 text-[8px] font-mono mb-1 tracking-widest">
                    <span className="w-1 h-1 bg-valo-green rounded-full animate-pulse" />
                    <span>TACTICAL MULTI-EVENT OPERATION</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-display font-bold uppercase tracking-tight text-white group-hover:text-valo-green transition-colors leading-snug">
                    {ach.title}
                  </h3>
                  <p className="text-sm text-gray-400 mt-2 font-sans leading-relaxed">
                    {ach.description}
                  </p>
                </div>
              </div>

              {/* Card Footer toggle */}
              <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4 pl-2">
                <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest flex items-center gap-1.5">
                  <Shield size={10} className="text-valo-green/30" />
                  SECURE_SYS // CLEARANCE_LVL5
                </span>
                
                <div className="flex items-center gap-1.5 font-mono text-[10px] text-valo-green uppercase tracking-widest group-hover:translate-x-1 transition-transform font-bold">
                  <span>{isExpanded ? 'COLLAPSE LOGS' : 'DECRYPT LOGS'}</span>
                  {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </div>
              </div>
              
              <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-valo-green group-hover:w-full transition-all duration-500" />
            </div>
            
            {/* Hover Tooltip display: Outside of the clip-path container so it doesn't get clipped! */}
            <AnimatePresence>
              {hoveredCardId === ach.id && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.95 }}
                  className="absolute -top-16 right-4 z-30 bg-[#0b1219]/95 border border-valo-green/40 px-3 py-2 clip-path-valo shadow-[0_0_15px_rgba(22,255,141,0.15)] font-mono text-[9px] uppercase tracking-wider text-valo-green pointer-events-none hidden md:block"
                >
                  <div className="flex items-center gap-1.5 border-b border-valo-green/20 pb-1 mb-1">
                    <span className="w-1.5 h-1.5 bg-valo-green rounded-full animate-pulse" />
                    <span>HUD: OPERATION ENCRYPTED</span>
                  </div>
                  <div>OPERATION_ID: {ach.id}</div>
                  <div>STATUS: ACTIVE // MULTI-EVENT</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* Mission Record Component: Subtly scaled down container (slightly smaller padding & sizes) */
          <div 
            className="relative cursor-pointer w-full group"
            onMouseEnter={() => {
              valoAudio.playHover();
              setHoveredCardId(ach.id);
            }}
            onMouseLeave={() => setHoveredCardId(null)}
            onClick={() => onCardClick(ach)}
          >
            <div 
              className={`p-5 md:p-6 bg-valo-dark/15 hover:bg-valo-dark/35 border clip-path-valo transition-all duration-500 shadow-md ${
                hoveredCardId === ach.id 
                  ? 'border-valo-green/20 shadow-[0_0_20px_rgba(22,255,141,0.03)]' 
                  : 'border-white/5'
              }`}
            >
              {/* Scanlines layer */}
              <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_bottom,rgba(22,255,141,0.05)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />

              {/* Top HUD bar */}
              <div className="flex justify-between items-center mb-5">
                <span className="font-mono text-[10px] text-valo-green bg-valo-green/5 border border-valo-green/10 px-2 py-0.5 clip-path-valo uppercase tracking-widest">
                  {ach.year}
                </span>
                <span className="font-mono text-[8px] text-white/20 uppercase tracking-widest">
                  // MISSION_RECORD
                </span>
              </div>

              {/* Main Content */}
              <div className="flex items-start gap-3.5">
                <div className="bg-valo-green/5 w-10 h-10 flex items-center justify-center clip-path-valo border border-valo-green/15 group-hover:bg-valo-green group-hover:border-valo-green group-hover:text-valo-bg transition-all duration-300 flex-shrink-0">
                  <Icon size={18} className="text-valo-green group-hover:text-valo-bg transition-colors" />
                </div>
                
                <div>
                  <h3 className="text-lg font-display font-bold uppercase tracking-tight text-white group-hover:text-valo-green transition-colors leading-snug">
                    {ach.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1.5 font-sans leading-relaxed">
                    {ach.description}
                  </p>
                </div>
              </div>

              {/* Image Preview Thumbnail - always clearly visible */}
              {ach.image && (
                <div className="mt-4 relative aspect-[16/9] w-full overflow-hidden clip-path-valo border border-white/15 group-hover:border-valo-green/50 transition-colors bg-black/40">
                  <img
                    src={ach.image}
                    alt={ach.title}
                    className="w-full h-full object-cover object-center transition-all duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* Card Footer toggle */}
              <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-3">
                <span className="font-mono text-[8px] text-white/20 uppercase tracking-widest flex items-center gap-1.5">
                  <Shield size={9} className="text-valo-green/20" />
                  INTEL_SYS
                </span>
                
                <div className="flex items-center gap-1.5 font-mono text-[9px] text-valo-green uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                  <span>OPEN DOSSIER</span>
                  <Eye size={11} />
                </div>
              </div>

              <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-valo-green group-hover:w-full transition-all duration-500" />
            </div>
            
            {/* Hover Tooltip display: Outside of the clip-path container so it doesn't get clipped! */}
            <AnimatePresence>
              {hoveredCardId === ach.id && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.95 }}
                  className="absolute -top-16 right-4 z-30 bg-[#0b1219]/95 border border-valo-green/40 px-3 py-2 clip-path-valo shadow-[0_0_15px_rgba(22,255,141,0.15)] font-mono text-[9px] uppercase tracking-wider text-valo-green pointer-events-none hidden md:block"
                >
                  <div className="flex items-center gap-1.5 border-b border-valo-green/20 pb-1 mb-1">
                    <span className="w-1.5 h-1.5 bg-valo-green rounded-full animate-pulse" />
                    <span>HUD: RECORD CLEAR</span>
                  </div>
                  <div>RECORD_ID: {ach.id}</div>
                  <div>STATUS: SECURE // REQ DOSSIER</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Accordion Branching Secondary Tree for Grouped Operational Nodes */}
        <AnimatePresence>
          {ach.type === 'grouped' && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="relative pl-6 md:pl-8 mt-6 flex flex-col gap-6">
                
                {/* Secondary tree list connector path */}
                <div className="absolute left-0 top-0 bottom-6 w-[2px] bg-gradient-to-b from-valo-green/40 via-valo-green/20 to-transparent" />
                
                {ach.subEvents?.map((sub, sIdx) => (
                  <motion.div 
                    key={sub.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: sIdx * 0.08 }}
                    className="relative group/sub cursor-pointer"
                    onMouseEnter={() => {
                      valoAudio.playHover();
                      setHoveredSubId(sub.id);
                    }}
                    onMouseLeave={() => setHoveredSubId(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      valoAudio.playClick();
                      onSubEventClick(sub, ach);
                    }}
                  >
                    {/* Secondary Sub-Path node connector */}
                    <div className="absolute -left-[31px] md:-left-[39px] top-4 w-4 h-[1px] bg-valo-green/30 group-hover/sub:bg-valo-green/60" />
                    <div className="absolute -left-[34px] md:-left-[42px] top-2.5 w-3 h-3 rounded-full bg-valo-bg border border-valo-green/30 flex items-center justify-center group-hover/sub:border-valo-green group-hover/sub:shadow-[0_0_8px_rgba(22,255,141,0.4)] transition-all">
                      <div className="w-1.5 h-1.5 rounded-full bg-valo-green/60 group-hover/sub:bg-valo-green" />
                    </div>

                    {/* Nested Card content */}
                    <div className="bg-valo-dark/20 hover:bg-valo-dark/50 border border-valo-green/5 hover:border-valo-green/20 p-4 clip-path-valo transition-all duration-300 relative">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                        <h4 className="font-display font-bold text-base text-white group-hover/sub:text-valo-green transition-colors uppercase">
                          {sub.title}
                        </h4>
                        {sub.date && (
                          <span className="font-mono text-[9px] text-valo-green/50 tracking-wider">
                            {sub.date}
                          </span>
                        )}
                      </div>
                      
                      {sub.image && (
                        <div className="w-full h-24 mb-3 overflow-hidden clip-path-valo relative">
                          <img 
                            src={sub.image} 
                            alt={sub.title} 
                            className="w-full h-full object-cover opacity-60 group-hover/sub:scale-105 group-hover/sub:opacity-85 transition-all duration-500" 
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-valo-bg/50 to-transparent" />
                        </div>
                      )}

                      <p className="text-xs text-gray-400 font-sans leading-relaxed">
                        {sub.description}
                      </p>
                      
                      <div className="mt-3 flex items-center gap-1 font-mono text-[9px] text-valo-green/50 group-hover/sub:text-valo-green transition-colors">
                        <span>VIEW DECRYPTED SUB-DOSSIER</span>
                        <Eye size={10} />
                      </div>
                    </div>

                    {/* Hover Tooltip display */}
                    <AnimatePresence>
                      {hoveredSubId === sub.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 5, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 3, scale: 0.95 }}
                          className="absolute -top-14 right-4 z-30 bg-[#0b1219]/95 border border-valo-green/40 px-3 py-1.5 clip-path-valo shadow-[0_0_12px_rgba(22,255,141,0.15)] font-mono text-[8px] uppercase tracking-wider text-valo-green pointer-events-none hidden md:block"
                        >
                          <div className="flex items-center gap-1.5 border-b border-valo-green/20 pb-0.5 mb-1">
                            <span className="w-1.5 h-1.5 bg-valo-green rounded-full animate-pulse" />
                            <span>HUD: SUB-EVENT INTEL</span>
                          </div>
                          <div>SUB_ID: {sub.id}</div>
                          <div>ACTION: CLICK TO DECRYPT</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Empty column (Desktop spacing to maintain strict grid alignment) */}
      <div className="hidden md:block w-[32%]" />
    </div>
  );
};

export const AchievementsSection: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedDossier, setSelectedDossier] = useState<DossierData | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/data/achievements.json')
      .then(res => res.json())
      .then(data => setAchievements(data))
      .catch(err => console.error('Error fetching achievements data:', err));
  }, []);

  useEffect(() => {
    let targetScrollY = window.scrollY;
    let currentScrollY = window.scrollY;
    let isAnimating = false;

    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    const animationLoop = () => {
      // Calculate new scroll position using lerp interpolation (12% per frame)
      currentScrollY = lerp(currentScrollY, targetScrollY, 0.12);

      // Scroll to the new position
      window.scrollTo(0, currentScrollY);

      // Continue animating if we haven't reached the target
      if (Math.abs(currentScrollY - targetScrollY) > 0.5) {
        requestAnimationFrame(animationLoop);
      } else {
        isAnimating = false;
        window.scrollTo(0, targetScrollY); // Snap exactly to target
      }
    };

    const handleWheel = (e: WheelEvent) => {
      // Prevent native jumpy scroll
      e.preventDefault();

      // Sync if the actual scroll position was changed by other means (e.g. scrollbar)
      if (Math.abs(window.scrollY - currentScrollY) > 2) {
        currentScrollY = window.scrollY;
        targetScrollY = window.scrollY;
      }

      // If we weren't animating, sync target/current to current scroll
      if (!isAnimating) {
        currentScrollY = window.scrollY;
        targetScrollY = window.scrollY;
      }

      // Calculate new target scroll position
      const scrollFactor = 0.4;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      targetScrollY = Math.max(0, Math.min(maxScroll, targetScrollY + e.deltaY * scrollFactor));

      if (!isAnimating) {
        isAnimating = true;
        requestAnimationFrame(animationLoop);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);





  const iconMap: any = {
    Award: Award,
    Trophy: Trophy,
    Globe: Globe,
    Star: Star
  };

  const handleGroupToggle = (id: string) => {
    valoAudio.playClick();
    setExpandedGroups(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Standard standalone card click dossier mapper
  const handleCardClick = (ach: Achievement) => {
    if (ach.type === 'single') {
      valoAudio.playClick();
      setSelectedDossier({
        title: ach.title,
        dateOrYear: ach.year,
        description: ach.description,
        longDescription: ach.longDescription,
        image: ach.image,
        link: ach.link,
        typeLabel: 'MISSION RECORD DOSSIER'
      });
    } else {
      handleGroupToggle(ach.id);
    }
  };

  // Nested sub-event click dossier mapper to display inside dossier modal
  const handleSubEventClick = (sub: SubEvent, ach: Achievement) => {
    setSelectedDossier({
      title: sub.title,
      dateOrYear: sub.date || ach.year,
      description: sub.description,
      longDescription: sub.description, // Reuses description field as body content
      image: sub.image,
      link: sub.link,
      typeLabel: 'SUB-OPERATIONAL DOSSIER'
    });
  };

  return (
    <section id="achievements" className="py-24 bg-valo-dark/10 relative overflow-hidden" ref={containerRef}>


      {/* Tactical Background Details */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(22,255,141,0.03),transparent_40%)] pointer-events-none" />
      <div className="absolute top-24 left-12 w-32 h-32 border border-white/5 clip-path-valo opacity-20 pointer-events-none" />
      <div className="absolute bottom-24 right-12 w-48 h-48 border border-valo-green/5 clip-path-valo opacity-20 pointer-events-none" />

      <div className="container mx-auto px-6 relative">
        <SectionHeader 
          number="04" 
          title="Sector Records" 
          subtitle="Achievements & Chronicles" 
          icon={Trophy}
        />

        {/* Timeline Path Container */}
        <div className="relative w-full max-w-5xl mx-auto mt-24">
          
          {/* MOBILE ONLY: Main Background Path Line */}
          <div className="absolute left-8 top-0 bottom-0 w-[2px] bg-white/5 md:hidden -translate-x-1/2" />
          
          {/* Timeline Items */}
          <div className="relative z-10 flex flex-col gap-16 md:gap-0">
            {achievements.map((ach, i) => {
              const isExpanded = expandedGroups[ach.id];

              return (
                <TimelineRow
                  key={ach.id}
                  ach={ach}
                  i={i}
                  total={achievements.length}
                  hoveredCardId={hoveredCardId}
                  setHoveredCardId={setHoveredCardId}
                  isExpanded={isExpanded}
                  onToggle={() => handleGroupToggle(ach.id)}
                  onCardClick={handleCardClick}
                  onSubEventClick={handleSubEventClick}
                  iconMap={iconMap}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* High-Fidelity Tactical Dossier Detail View (Modal) */}
      <AnimatePresence>
        {selectedDossier && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-valo-bg/95 backdrop-blur-sm"
            onClick={() => {
              valoAudio.playClick();
              setSelectedDossier(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.92, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 50, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="bg-valo-dark max-w-4xl w-full max-h-[90vh] overflow-y-auto clip-path-valo valo-border p-0 relative shadow-[0_0_50px_rgba(0,0,0,0.8)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button overlay */}
              <button 
                onClick={() => {
                  valoAudio.playClick();
                  setSelectedDossier(null);
                }}
                className="absolute top-6 right-6 z-20 bg-valo-bg/60 p-2 hover:bg-valo-red hover:text-white border border-white/5 hover:border-valo-red transition-all cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className={selectedDossier.image ? "grid md:grid-cols-2" : "block"}>
                
                {/* Visual Dossier Banner (Clean image display with no vignette or watermark overlay) */}
                {selectedDossier.image && (
                  <div className="h-64 md:h-auto min-h-[320px] relative overflow-hidden bg-black/60 flex items-center justify-center p-2">
                    <img 
                      src={selectedDossier.image} 
                      alt={selectedDossier.title}
                      className="w-full h-full max-h-[500px] object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {/* Tactical Bio/Data Dossier Description */}
                <div className="p-8 md:p-12 flex flex-col justify-between">
                  <div>
                    {/* Classification Metadata badge */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="bg-valo-green text-valo-bg px-3 py-0.5 text-[9px] font-mono tracking-widest font-bold uppercase clip-path-valo">
                        {selectedDossier.dateOrYear}
                      </span>
                      <span className="font-mono text-[9px] tracking-widest text-valo-green/70 uppercase">
                        // {selectedDossier.typeLabel}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl md:text-4xl font-display font-bold uppercase tracking-tight mb-6 text-white leading-none">
                      {selectedDossier.title}
                    </h2>
                    
                    {/* Rich text body description */}
                    <p className="text-gray-300 text-sm leading-relaxed mb-8 font-sans border-l-2 border-valo-green/30 pl-4 py-1">
                      {selectedDossier.longDescription || selectedDossier.description}
                    </p>

                    {/* Technical stats boxes */}
                    <div className="grid grid-cols-2 gap-4 mb-8 pt-6 border-t border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="bg-valo-green/10 p-2 text-valo-green clip-path-valo"><Calendar size={16} /></div>
                        <div>
                          <p className="text-[9px] font-mono uppercase text-white/40">Operation Date</p>
                          <p className="font-bold text-xs uppercase font-mono tracking-wider">{selectedDossier.dateOrYear} // COMPLETED</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-valo-green/10 p-2 text-valo-green clip-path-valo"><Clock size={16} /></div>
                        <div>
                          <p className="text-[9px] font-mono uppercase text-white/40">Mission Status</p>
                          <p className="font-bold text-xs uppercase font-mono text-valo-green tracking-wider font-bold">VERIFIED</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {selectedDossier.link && (
                    <ValoButton 
                      variant="primary" 
                      onClick={() => {
                        valoAudio.playClick();
                        window.open(selectedDossier.link, '_blank');
                      }}
                      className="w-full"
                    >
                      Access Secure Logs <ExternalLink size={14} />
                    </ValoButton>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
