import React, { useRef, useEffect } from 'react';

// Deterministic particle parameters created once upon module load
const PARTICLES = Array.from({ length: 488 }).map((_, idx) => {
  const left = ((idx * 13) % 100); // 0% to 100% horizontal column
  const top = ((idx * 17) % 100);  // 0% to 100% initial vertical distribution
  const size = (idx % 4) * 0.8 + 2.2; // 2.2px to 4.6px diameter
  const duration = 15 + (idx % 20) * 5; // 15s to 110s float cycle
  const delay = -(idx % 8) * 8;    // Negative delay for initial spread
  const depth = (idx % 3) + 1;     // Layer depth: 1, 2, or 3
  const opacity = 0.30 + ((idx * 11) % 10) * 0.065; // [0.30, 0.95]
  const blur = (depth === 3 ? ((idx * 7) % 5) * 0.5 + 0.4 : depth === 2 ? ((idx * 5) % 4) * 0.35 : ((idx * 3) % 3) * 0.2);
  const glowRadius = 4.0 + ((idx * 23) % 11) * 1.0; // 4.0px to 14.0px glow
  return { id: idx, left, top, size, duration, delay, depth, opacity, blur, glowRadius };
});

const CONNECTION_RADIUS = 165; // px radius around cursor on desktop

interface ParticleSprite {
  canvas: HTMLCanvasElement;
  half: number;
}

// Pre-render glowing dot sprites once so the animation loop only performs GPU texture blits
const spriteCache = new Map<string, ParticleSprite>();

function getOrCreateSprite(size: number, glowRadius: number, blur: number): ParticleSprite {
  const key = `${size.toFixed(1)}_${glowRadius.toFixed(1)}_${blur.toFixed(1)}`;
  const existing = spriteCache.get(key);
  if (existing) return existing;

  const canvas = document.createElement('canvas');
  const pad = Math.ceil(glowRadius * 1.5 + blur * 2 + 4);
  const dim = Math.ceil(size + pad * 2);
  canvas.width = dim;
  canvas.height = dim;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    const res = { canvas, half: dim / 2 };
    spriteCache.set(key, res);
    return res;
  }

  const center = dim / 2;
  const radius = size / 2;

  ctx.save();
  if (blur > 0) {
    ctx.filter = `blur(${blur}px)`;
  }
  // Outer diffused glow
  ctx.shadowColor = '#16ff8d';
  ctx.shadowBlur = glowRadius * 1.5;
  ctx.fillStyle = 'rgba(22, 255, 141, 0.6)';
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.fill();

  // Core sharp dot + inner glow
  ctx.shadowBlur = glowRadius;
  ctx.fillStyle = '#16ff8d';
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const res = { canvas, half: dim / 2 };
  spriteCache.set(key, res);
  return res;
}

interface ParticleInstance {
  id: number;
  x: number;
  y: number;
  speed: number;
  depth: number;
  opacity: number;
  sprite: ParticleSprite;
  leftPct: number;
  screenX: number;
  screenY: number;
  offsetX: number;
  offsetY: number;
  vx: number;
  vy: number;
}

function initParticles(width: number, height: number): ParticleInstance[] {
  const totalH = height + 60;
  const depthSpeedFactors: Record<number, number> = { 1: 1.3, 2: 1.0, 3: 0.7 };

  return PARTICLES.map((p) => {
    const factor = depthSpeedFactors[p.depth] || 1.0;
    const cycleDuration = p.duration * factor;
    const speed = 1200 / cycleDuration;
    const initialOffset = ((-p.delay % cycleDuration) / cycleDuration) * -1200;
    const rawY = (p.top / 100) * height + initialOffset;
    const y = ((rawY % totalH) + totalH) % totalH - 30;
    const x = (p.left / 100) * width;
    const sprite = getOrCreateSprite(p.size, p.glowRadius, p.blur);

    return {
      id: p.id,
      x,
      y,
      speed,
      depth: p.depth,
      opacity: p.opacity,
      sprite,
      leftPct: p.left,
      screenX: x,
      screenY: y,
      offsetX: 0,
      offsetY: 0,
      vx: 0,
      vy: 0,
    };
  });
}

export const BackgroundParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const particlesRef = useRef<ParticleInstance[]>([]);

  useEffect(() => {
    const isDesktop = () => window.innerWidth >= 768 && window.matchMedia('(pointer: fine)').matches;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create particles once at startup
    const w = window.innerWidth;
    const h = window.innerHeight;
    particlesRef.current = initParticles(w, h);

    const updateCanvasSize = () => {
      const curW = window.innerWidth;
      const curH = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(curW * dpr);
      canvas.height = Math.round(curH * dpr);
      canvas.style.width = `${curW}px`;
      canvas.style.height = `${curH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        particles[i].x = (particles[i].leftPct / 100) * curW;
        particles[i].screenX = particles[i].x + particles[i].offsetX;
      }
    };
    updateCanvasSize();

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDesktop()) return;
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    // Tactical push blast on click or tap
    const applyBlast = (clickX: number, clickY: number) => {
      const blastRadius = CONNECTION_RADIUS * 1.45; // ~239px push blast zone
      const particles = particlesRef.current;
      const len = particles.length;

      for (let i = 0; i < len; i++) {
        const p = particles[i];
        const dx = p.screenX - clickX;
        const dy = p.screenY - clickY;
        if (Math.abs(dx) > blastRadius || Math.abs(dy) > blastRadius) continue;

        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < blastRadius) {
          const force = 1 - dist / blastRadius;
          const pushSpeed = force * 460 + 140; // Punchy, immediate velocity impulse (px/s)
          const angle = dist > 0.001 ? Math.atan2(dy, dx) : Math.random() * Math.PI * 2;
          p.vx += Math.cos(angle) * pushSpeed;
          p.vy += Math.sin(angle) * pushSpeed;
        }
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return; // Left click only
      applyBlast(e.clientX, e.clientY);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        applyBlast(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', updateCanvasSize);
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });

    lastTimeRef.current = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = now;

      const curW = window.innerWidth;
      const curH = window.innerHeight;
      const totalH = curH + 60;

      ctx.clearRect(0, 0, curW, curH);

      const scrollMax = Math.max(1, document.documentElement.scrollHeight - curH);
      const scrollProgress = Math.min(Math.max(window.scrollY / scrollMax, 0), 1);

      const particles = particlesRef.current;
      const len = particles.length;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const showMouseLines = mx > -1000 && isDesktop();

      for (let i = 0; i < len; i++) {
        const p = particles[i];

        // Smooth continuous upward float of base position
        p.y -= p.speed * dt;
        // Wrap around over the top and back down to the bottom
        if (p.y < -30) {
          p.y += totalH;
        } else if (p.y > curH + 30) {
          p.y -= totalH;
        }

        // Spring-damper physics for click displacement
        if (p.offsetX !== 0 || p.offsetY !== 0 || p.vx !== 0 || p.vy !== 0) {
          p.offsetX += p.vx * dt;
          p.offsetY += p.vy * dt;

          const springK = 6.2;
          p.vx += -springK * p.offsetX * dt;
          p.vy += -springK * p.offsetY * dt;

          const damping = Math.exp(-2.2 * dt);
          p.vx *= damping;
          p.vy *= damping;

          if (Math.abs(p.offsetX) < 0.25 && Math.abs(p.offsetY) < 0.25 && Math.abs(p.vx) < 1 && Math.abs(p.vy) < 1) {
            p.offsetX = 0;
            p.offsetY = 0;
            p.vx = 0;
            p.vy = 0;
          }
        }

        // Parallax vertical offset per depth layer
        const parallaxShift = (p.depth === 1 ? -150 : p.depth === 2 ? -300 : -500) * scrollProgress;
        const baseScreenY = ((p.y + parallaxShift - (-30)) % totalH + totalH) % totalH - 30;

        // Final visual coordinates on screen (combining base wrapped position and click impulse offset)
        const visualX = p.x + p.offsetX;
        const visualY = baseScreenY + p.offsetY;

        // Cache on-screen coordinates for exact click hit-testing
        p.screenX = visualX;
        p.screenY = visualY;

        // Draw tactical connection lines to cursor if in range
        if (showMouseLines) {
          const dx = visualX - mx;
          const dy = visualY - my;
          if (Math.abs(dx) <= CONNECTION_RADIUS && Math.abs(dy) <= CONNECTION_RADIUS) {
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= CONNECTION_RADIUS) {
              const alpha = 1 - dist / CONNECTION_RADIUS;
              ctx.save();
              ctx.beginPath();
              ctx.moveTo(mx, my);
              ctx.lineTo(visualX, visualY);
              ctx.shadowColor = '#16ff8d';
              ctx.shadowBlur = 3 + (1 - alpha) * 12;
              ctx.strokeStyle = `rgba(22, 255, 141, ${alpha * 0.8})`;
              ctx.lineWidth = alpha * 0.95;
              ctx.stroke();
              ctx.restore();
            }
          }
        }

        // Fast GPU sprite blit
        ctx.globalAlpha = p.opacity;
        ctx.drawImage(p.sprite.canvas, visualX - p.sprite.half, visualY - p.sprite.half);
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', updateCanvasSize);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[-10]"
      aria-hidden="true"
    />
  );
};
