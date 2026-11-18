import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Expand, Sparkles } from 'lucide-react';
import { valoAudio } from '../../utils/audio';

interface PhotoStreamLoopProps {
  images: string[];
  onSelectImage: (image: string) => void;
  isPausedModal?: boolean;
}

export const PhotoStreamLoop: React.FC<PhotoStreamLoopProps> = ({
  images,
  onSelectImage,
  isPausedModal = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // We duplicate images 3 times to guarantee a seamless infinite conveyor
  const loopImages = images.length > 0 ? [...images, ...images, ...images] : [];

  // Card dimensions + gap
  const [itemMetrics, setItemMetrics] = useState({
    width: 320,
    height: 210,
    gap: 20,
  });

  useEffect(() => {
    const updateMetrics = () => {
      const w = window.innerWidth;
      if (w >= 1024) {
        setItemMetrics({ width: 320, height: 210, gap: 24 });
      } else if (w >= 640) {
        setItemMetrics({ width: 260, height: 175, gap: 18 });
      } else {
        setItemMetrics({ width: 210, height: 145, gap: 14 });
      }
    };

    updateMetrics();
    window.addEventListener('resize', updateMetrics);
    return () => window.removeEventListener('resize', updateMetrics);
  }, []);

  const singleSetWidth = images.length * (itemMetrics.width + itemMetrics.gap);

  // Motion & Physics State Refs
  const offsetRef = useRef(0);
  const velocityRef = useRef(1.0); // Default left-to-right cruise speed (px/frame)
  const baseSpeed = 1.0; // Steady left-to-right flow speed

  const isPointerDownRef = useRef(false);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const dragStartTime = useRef<number>(0);
  const hasDraggedRef = useRef(false);
  const lastDragX = useRef(0);
  const lastDragTime = useRef(0);
  const isHoveredRef = useRef(false);
  const isModalOpenRef = useRef(isPausedModal);

  useEffect(() => {
    isModalOpenRef.current = isPausedModal;
  }, [isPausedModal]);

  // High performance RAF loop using direct DOM transform (zero React re-render overhead)
  useEffect(() => {
    let animId: number;

    const tick = () => {
      const setW = singleSetWidth;

      // Only advance position if modal is NOT open
      if (!isModalOpenRef.current && setW > 0) {
        if (!isPointerDownRef.current) {
          // If we have fling momentum, decelerate gradually towards base speed
          // (or if user hovered, gently slow down to subtle float)
          const targetCruise = isHoveredRef.current ? 0.35 : baseSpeed;

          // Smooth exponential friction damping towards target cruise speed
          velocityRef.current = velocityRef.current * 0.95 + targetCruise * 0.05;

          // Advance offset to the right (left to right flow)
          offsetRef.current += velocityRef.current;
        }

        // Seamless modulo wrap-around
        if (offsetRef.current >= setW) {
          offsetRef.current -= setW;
        } else if (offsetRef.current < 0) {
          offsetRef.current += setW;
        }

        // Apply hardware-accelerated transform to track
        if (trackRef.current) {
          trackRef.current.style.transform = `translate3d(${offsetRef.current.toFixed(2)}px, 0px, 0px)`;
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [singleSetWidth, baseSpeed]);

  // Pointer interactions for dragging and quick-release flicking
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || isModalOpenRef.current) return;

    isPointerDownRef.current = true;
    hasDraggedRef.current = false;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    dragStartTime.current = Date.now();
    lastDragX.current = e.clientX;
    lastDragTime.current = Date.now();
    velocityRef.current = 0; // Pause flow while actively held
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current || !dragStartPos.current) return;

    const deltaXFromStart = e.clientX - dragStartPos.current.x;
    const deltaYFromStart = e.clientY - dragStartPos.current.y;

    // Only engage drag if moved beyond threshold
    if (!hasDraggedRef.current) {
      if (Math.hypot(deltaXFromStart, deltaYFromStart) > 6) {
        hasDraggedRef.current = true;
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch (_) {}
      }
    }

    if (hasDraggedRef.current) {
      const now = Date.now();
      const dt = Math.max(1, now - lastDragTime.current);
      const dx = e.clientX - lastDragX.current;

      // Instantly track finger/cursor position
      offsetRef.current += dx;

      // Calculate fling velocity in px/frame (approx 16ms)
      const instantaneousVel = (dx / dt) * 16;
      velocityRef.current = instantaneousVel;

      lastDragX.current = e.clientX;
      lastDragTime.current = now;

      // Keep wrapped
      if (singleSetWidth > 0) {
        if (offsetRef.current >= singleSetWidth) {
          offsetRef.current -= singleSetWidth;
        } else if (offsetRef.current < 0) {
          offsetRef.current += singleSetWidth;
        }
      }

      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${offsetRef.current.toFixed(2)}px, 0px, 0px)`;
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch (_) {}

    // If it was a quick flick/drag, cap maximum acceleration for a satisfying feel
    if (hasDraggedRef.current) {
      // Limit max acceleration to avoid disorienting speeds, while keeping it fast & fluid
      const maxFlick = 40;
      velocityRef.current = Math.max(-maxFlick, Math.min(maxFlick, velocityRef.current));

      // If user released with almost zero speed, give it a tiny nudge so it continues smoothly
      if (Math.abs(velocityRef.current) < 0.5) {
        velocityRef.current = baseSpeed;
      }
    }

    dragStartPos.current = null;
    // Reset hasDragged after brief delay so click handler knows if it was a drag
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 80);
  };

  const handleCardClick = useCallback(
    (e: React.MouseEvent, img: string) => {
      e.stopPropagation();
      // If user was dragging, do NOT trigger click or view
      if (hasDraggedRef.current) return;

      // Clean click: pause flow immediately and open image in gallery lightbox
      velocityRef.current = 0;
      valoAudio.playClick();
      onSelectImage(img);
    },
    [onSelectImage]
  );

  return (
    <div className="relative w-full overflow-hidden py-8 select-none">
      {/* Edge Vignette Fades: Smooth infinite emergence on left & fade-out on right */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-28 lg:w-40 bg-gradient-to-r from-valo-bg via-valo-bg/80 to-transparent z-20" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-28 lg:w-40 bg-gradient-to-l from-valo-bg via-valo-bg/80 to-transparent z-20" />

      {/* Main Drag Stage Container */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onMouseEnter={() => { isHoveredRef.current = true; }}
        onMouseLeave={() => { isHoveredRef.current = false; }}
        className="relative w-full cursor-grab active:cursor-grabbing touch-pan-y py-4 overflow-hidden"
      >
        {/* Infinite Moving Ribbon Track */}
        <div
          ref={trackRef}
          className="flex will-change-transform"
          style={{
            gap: `${itemMetrics.gap}px`,
            // Offset initially by -singleSetWidth so the items seamlessly span from the far left
            marginLeft: `-${singleSetWidth}px`,
          }}
        >
          {loopImages.map((img, i) => (
            <div
              key={`${img}-${i}`}
              onClick={(e) => handleCardClick(e, img)}
              style={{
                width: `${itemMetrics.width}px`,
                height: `${itemMetrics.height}px`,
                flexShrink: 0,
              }}
              className="group relative cursor-pointer clip-path-valo border border-white/15 bg-[#111111] shadow-[0_10px_25px_rgba(0,0,0,0.6)] transition-all duration-300 hover:border-valo-green hover:shadow-[0_0_30px_rgba(22,255,141,0.35)] hover:-translate-y-2 overflow-hidden"
            >
              {/* Image in 100% natural, true-to-life full color (NO green tint) */}
              <img
                src={img}
                alt={`Sector Archive ${i + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none"
                loading="lazy"
                draggable={false}
              />

              {/* Tactical Corner Brackets */}
              <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t border-l border-white/40 group-hover:border-valo-green pointer-events-none transition-colors" />
              <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t border-r border-white/40 group-hover:border-valo-green pointer-events-none transition-colors" />
              <div className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b border-l border-white/40 group-hover:border-valo-green pointer-events-none transition-colors" />
              <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b border-r border-white/40 group-hover:border-valo-green pointer-events-none transition-colors" />

              {/* Hover Expand Button in corner (Clean, NO node writings) */}
              <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/80 border border-valo-green/60 p-1.5 text-valo-green backdrop-blur-md clip-path-valo pointer-events-none shadow-md">
                <Expand size={15} />
              </div>

              {/* Bottom Subtle Vignette Bar on Hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex items-end justify-between p-3">
                <span className="font-mono text-[10px] text-white/90 uppercase tracking-widest font-bold">
                  EXPAND LOG
                </span>
                <span className="font-mono text-[9px] text-valo-green uppercase tracking-widest">
                  CLICK TO VIEW
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

