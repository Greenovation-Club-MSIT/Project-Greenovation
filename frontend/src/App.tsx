import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { valoAudio } from './utils/audio';
import { BackgroundParticles } from './components/layout/BackgroundParticles';
import { initGlobalGlitchHover } from './utils/glitchHover';

// Pages
import { HomePage } from './pages/HomePage';
import { EventsPage } from './pages/EventsPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { MembersPage } from './pages/MembersPage';
import { GalleryPage } from './pages/GalleryPage';
import { RegisterPage } from './pages/RegisterPage';
import { ContactPage } from './pages/ContactPage';

const TooltipRenderer = () => {
  const [tooltip, setTooltip] = React.useState<{ text: string, x: number, y: number, isTop: boolean } | null>(null);

  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      if (window.innerWidth < 768) return; // Disable tooltips on mobile
      const target = e.target as HTMLElement;
      const el = target.closest('[data-tooltip]') as HTMLElement;
      if (el) {
        const text = el.getAttribute('data-tooltip');
        if (text) {
          const rect = el.getBoundingClientRect();
          const isTop = rect.bottom > window.innerHeight - 50;
          setTooltip({
            text,
            x: rect.left + rect.width / 2,
            y: isTop ? rect.top - 10 : rect.bottom + 10,
            isTop
          });
        }
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-tooltip]')) {
        setTooltip(null);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-tooltip]')) {
        setTooltip(null);
      }
    }

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  if (!tooltip) return null;

  return (
    <div 
      className="fixed z-[9999] pointer-events-none bg-[#111111] border border-valo-green/30 text-valo-green px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest clip-path-valo"
      style={{
        left: tooltip.x,
        top: tooltip.isTop ? 'auto' : tooltip.y,
        bottom: tooltip.isTop ? window.innerHeight - tooltip.y : 'auto',
        transform: `translate(-50%, ${tooltip.isTop ? '0' : '0'})`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
      }}
    >
      {tooltip.text}
    </div>
  );
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export default function App() {
  // Global UI sounds
  useEffect(() => {
    // Audio system init & event listeners
    const handleFirstClick = () => {
      valoAudio.unlock();
      document.removeEventListener('click', handleFirstClick);
    };
    document.addEventListener('click', handleFirstClick);

    const isHoverReactive = (el: HTMLElement) => {
      if (['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName)) return true;
      const classStr = el.className;
      if (typeof classStr === 'string') {
        if (classStr.includes('cursor-pointer')) return true;
        if (classStr.includes('hover:')) return true;
      }
      return false;
    };

    const isClickReactive = (el: HTMLElement) => {
      if (['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName)) return true;
      const classStr = el.className;
      if (typeof classStr === 'string') {
        if (classStr.includes('cursor-pointer')) return true;
      }
      return false;
    };

    const playHover = (e: MouseEvent) => {
      let el: HTMLElement | null = e.target as HTMLElement;
      let reactiveEl = null;
      
      while (el && el !== document.body) {
        if (isHoverReactive(el)) {
          reactiveEl = el;
          break;
        }
        el = el.parentElement;
      }

      if (reactiveEl) {
        let relatedReactive = null;
        let rEl: HTMLElement | null = e.relatedTarget as HTMLElement;
        while (rEl && rEl !== document.body) {
          if (isHoverReactive(rEl)) {
            relatedReactive = rEl;
            break;
          }
          rEl = rEl.parentElement;
        }

        if (reactiveEl !== relatedReactive) {
          valoAudio.playHover();
        }
      }
    };

    const playClick = (e: MouseEvent) => {
      let el: HTMLElement | null = e.target as HTMLElement;
      while (el && el !== document.body) {
        if (isClickReactive(el)) {
          valoAudio.playClick();
          break;
        }
        el = el.parentElement;
      }
    };

    document.addEventListener('mouseover', playHover);
    document.addEventListener('mousedown', playClick);

    return () => {
      document.removeEventListener('click', handleFirstClick);
      document.removeEventListener('mouseover', playHover);
      document.removeEventListener('mousedown', playClick);
    };
  }, []);

  // Global Button & Link Glitch Hover Animation
  useEffect(() => {
    const cleanup = initGlobalGlitchHover();
    return cleanup;
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen selection:bg-valo-green selection:text-valo-bg flex flex-col relative">
        <BackgroundParticles />
        <TooltipRenderer />
        <Navbar />
        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/members" element={<MembersPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}
