import React, { useRef, useEffect, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

// Deterministic background particles to completely avoid hydration mismatches
const PARTICLES = Array.from({ length: 488 }).map((_, idx) => {
  const left = ((idx * 13) % 100); // 0% to 100%
  const top = ((idx * 17) % 100);  // 0% to 100%
  const size = (idx % 4) * 0.8 + 2.2; // 2.2px to 4.6px
  const duration = 15 + (idx % 20) * 5; // 15s to 110s float duration
  const delay = -(idx % 8) * 8;    // Negative delay
  const depth = (idx % 3) + 1;     // Layer depth: 1, 2, or 3
  // Vary opacity (visibility) randomly on a spectrum [0.30, 0.95]
  const opacity = 0.30 + ((idx * 11) % 10) * 0.065;
  // Variable depth blur: depth 3 has up to 2.4px blur, depth 2 has up to 1.2px, depth 1 is sharpest [0 - 0.6px]
  const blur = (depth === 3 ? ((idx * 7) % 5) * 0.5 + 0.4 : depth === 2 ? ((idx * 5) % 4) * 0.35 : ((idx * 3) % 3) * 0.2);
  // Vary glow size (glow radius) randomly on a spectrum [4.0px, 14.0px]
  const glowRadius = 4.0 + ((idx * 23) % 11) * 1.0; // range: 4.0px to 14.0px
  return { id: idx, left, top, size, duration, delay, depth, opacity, blur, glowRadius };
});

const CONNECTION_RADIUS = 165; // px radius around cursor (reduced from 200)

const MouseLineCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number>(0);
  const dotsRef = useRef<HTMLElement[]>([]);
  const physicsRef = useRef<Map<HTMLElement, { x: number; y: number; vx: number; vy: number }>>(new Map());

  const drawLines = useCallback((mx: number, my: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);

    if (mx < -1000) return;

    const dots = dotsRef.current;
    const len = dots.length;

    for (let i = 0; i < len; i++) {
      const dot = dots[i];
      const rect = dot.getBoundingClientRect();
      const px = rect.left + rect.width / 2;
      const py = rect.top + rect.height / 2;

      const dx = px - mx;
      const dy = py - my;
      if (Math.abs(dx) > CONNECTION_RADIUS || Math.abs(dy) > CONNECTION_RADIUS) continue;

      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > CONNECTION_RADIUS) continue;

      const alpha = 1 - dist / CONNECTION_RADIUS;

      // Variable blur effect: as lines extend outward, they diffuse and soften with a glowing blur
      // Near center: sharp crisp beam (shadowBlur ~ 2-4px)
      // Far periphery: soft diffused luminous glow (shadowBlur up to 16px)
      const lineGlow = 3 + (1 - alpha) * 12;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(mx, my);
      ctx.lineTo(px, py);
      ctx.shadowColor = '#16ff8d';
      ctx.shadowBlur = lineGlow;
      ctx.strokeStyle = `rgba(22, 255, 141, ${alpha * 0.8})`;
      ctx.lineWidth = alpha * 0.95;
      ctx.stroke();
      ctx.restore();
    }
  }, []);

  const isDesktop = () => window.innerWidth >= 768 && window.matchMedia('(pointer: fine)').matches;

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDesktop()) return;
    mouseRef.current = { x: e.clientX, y: e.clientY };
    // Immediately draw on mousemove to eliminate any input-to-render lag
    drawLines(e.clientX, e.clientY);
  }, [drawLines]);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -9999, y: -9999 };
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }, []);

  useEffect(() => {
    // Only run mouse tracker / lines on PC / desktop devices
    if (!isDesktop()) return;
    // Cache the DOM queries so we don't querySelectorAll on every mouse move
    const updateDots = () => {
      dotsRef.current = Array.from(document.querySelectorAll<HTMLElement>('[data-particle-dot]'));
    };
    updateDots();

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
      updateDots();
    };
    resize();
    window.addEventListener('resize', resize);

    // Smooth physics loop: velocity-based push + spring-damper return
    let lastTime = performance.now();
    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05); // delta in seconds
      lastTime = now;

      const physics = physicsRef.current;
      if (physics.size > 0) {
        physics.forEach((p, dot) => {
          // Integrated motion: update positions from current velocity
          p.x += p.vx * dt;
          p.y += p.vy * dt;

          // Natural spring physics: peak outward push occurs around ~0.5s, then gracefully reverts in ~1.0s
          const springK = 6.2;
          p.vx += -springK * p.x * dt;
          p.vy += -springK * p.y * dt;

          // Drag / damping to smoothly decelerate to rest
          const damping = Math.exp(-2.2 * dt);
          p.vx *= damping;
          p.vy *= damping;

          // Once settled at rest near zero, clean up style and map entry
          if (Math.abs(p.x) < 0.25 && Math.abs(p.y) < 0.25 && Math.abs(p.vx) < 1 && Math.abs(p.vy) < 1) {
            dot.style.transform = '';
            physics.delete(dot);
          } else {
            dot.style.transform = `translate(${p.x}px, ${p.y}px)`;
          }
        });
      }

      const { x: mx, y: my } = mouseRef.current;
      if (mx > -1000) {
        drawLines(mx, my);
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    const handleMouseDown = (e: MouseEvent) => {
      // Left click only (button 0)
      if (e.button !== 0) return;

      const clickX = e.clientX;
      const clickY = e.clientY;
      const blastRadius = CONNECTION_RADIUS * 1.35; // ~270px push zone
      const dots = dotsRef.current;
      const len = dots.length;
      const physics = physicsRef.current;

      for (let i = 0; i < len; i++) {
        const dot = dots[i];
        const rect = dot.getBoundingClientRect();
        const px = rect.left + rect.width / 2;
        const py = rect.top + rect.height / 2;

        const dx = px - clickX;
        const dy = py - clickY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < blastRadius) {
          // Gradual velocity impulse instead of instantaneous position teleportation
          const force = (1 - dist / blastRadius);
          const pushSpeed = force * 380 + 100; // velocity in px/s
          const angle = dist > 0.001 ? Math.atan2(dy, dx) : (Math.random() * Math.PI * 2);

          const impulseX = Math.cos(angle) * pushSpeed;
          const impulseY = Math.sin(angle) * pushSpeed;

          const current = physics.get(dot) || { x: 0, y: 0, vx: 0, vy: 0 };
          current.vx += impulseX;
          current.vy += impulseY;

          physics.set(dot, current);
        }
      }
    };

    window.addEventListener('mousedown', handleMouseDown);

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [handleMouseMove, handleMouseLeave, drawLines]);

  return (
    <canvas
      ref={canvasRef}
      className="hidden md:block fixed inset-0 pointer-events-none z-[-9]"
    />
  );
};

export const BackgroundParticles: React.FC = () => {
  // Global window scroll progress
  const { scrollYProgress } = useScroll();

  // Scroll vertical transforms for depth layers (fixed container parallax)
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -500]);

  return (
    <>
      {/* Canvas overlay for mouse-proximity connection lines */}
      <MouseLineCanvas />

      {/* Subtle Moving Parallax Particle Background Layers (fixed container at z-[-10]) */}
      {/* Layer 1 (Depth 1 - Slowest Parallax) */}
      <motion.div 
        style={{ y: y1 }} 
        className="fixed inset-x-0 top-0 h-[150vh] pointer-events-none overflow-hidden z-[-10]"
      >
        {PARTICLES.filter(p => p.depth === 1).map(p => (
          <motion.div
            key={p.id}
            style={{ 
              left: `${p.left}%`, 
              top: `${p.top}%`,
              opacity: p.opacity,
              filter: p.blur > 0 ? `blur(${p.blur}px)` : 'none'
            }}
            animate={{ y: [0, -1200] }}
            transition={{
              duration: p.duration * 1.3,
              repeat: Infinity,
              ease: "linear",
              delay: p.delay
            }}
            className="absolute flex items-center justify-center"
          >
            <div 
              data-particle-dot
              className="rounded-full bg-valo-green" 
              style={{ 
                width: p.size, 
                height: p.size,
                boxShadow: `0 0 ${p.glowRadius}px #16ff8d, 0 0 ${p.glowRadius * 1.5}px rgba(22, 255, 141, 0.6)`
              }} 
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Layer 2 (Depth 2 - Medium Parallax) */}
      <motion.div 
        style={{ y: y2 }} 
        className="fixed inset-x-0 top-0 h-[150vh] pointer-events-none overflow-hidden z-[-10]"
      >
        {PARTICLES.filter(p => p.depth === 2).map(p => (
          <motion.div
            key={p.id}
            style={{ 
              left: `${p.left}%`, 
              top: `${p.top}%`,
              opacity: p.opacity,
              filter: p.blur > 0 ? `blur(${p.blur}px)` : 'none'
            }}
            animate={{ y: [0, -1200] }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "linear",
              delay: p.delay
            }}
            className="absolute flex items-center justify-center"
          >
            <div 
              data-particle-dot
              className="rounded-full bg-valo-green" 
              style={{ 
                width: p.size, 
                height: p.size,
                boxShadow: `0 0 ${p.glowRadius}px #16ff8d, 0 0 ${p.glowRadius * 1.5}px rgba(22, 255, 141, 0.6)`
              }} 
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Layer 3 (Depth 3 - Fastest Parallax) */}
      <motion.div 
        style={{ y: y3 }} 
        className="fixed inset-x-0 top-0 h-[150vh] pointer-events-none overflow-hidden z-[-10]"
      >
        {PARTICLES.filter(p => p.depth === 3).map(p => (
          <motion.div
            key={p.id}
            style={{ 
              left: `${p.left}%`, 
              top: `${p.top}%`,
              opacity: p.opacity,
              filter: p.blur > 0 ? `blur(${p.blur}px)` : 'none'
            }}
            animate={{ y: [0, -1200] }}
            transition={{
              duration: p.duration * 0.7,
              repeat: Infinity,
              ease: "linear",
              delay: p.delay
            }}
            className="absolute flex items-center justify-center"
          >
            <div 
              data-particle-dot
              className="rounded-full bg-valo-green" 
              style={{ 
                width: p.size, 
                height: p.size,
                boxShadow: `0 0 ${p.glowRadius}px #16ff8d, 0 0 ${p.glowRadius * 1.5}px rgba(22, 255, 141, 0.6)`
              }} 
            />
          </motion.div>
        ))}
      </motion.div>
    </>
  );
};
