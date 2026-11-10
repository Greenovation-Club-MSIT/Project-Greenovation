import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Calendar, Award, Users, Image as ImageIcon, UserPlus, MessageSquare } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const NavIcon = ({ icon: Icon, href, tooltip, isActive }: { icon: any, href: string, tooltip: string, isActive?: boolean }) => (
  <Link 
    to={href} 
    data-tooltip={tooltip} 
    className={`flex items-center justify-center w-14 h-full transition-all relative group hover:scale-105 ${
      isActive ? 'text-valo-green bg-valo-green/10' : 'text-[#ece8e1]/70 hover:text-white hover:bg-white/5'
    }`}
  >
    <Icon size={22} strokeWidth={2} className={`transition-transform ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(22,255,141,0.6)]' : 'group-hover:scale-110'}`} />
    {/* Bottom underline */}
    <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-valo-green transition-transform origin-center ${
      isActive ? 'scale-x-100 shadow-[0_0_8px_#16ff8d]' : 'scale-x-0 group-hover:scale-x-100'
    }`} />
  </Link>
);

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const lastScrollY = useRef(0);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);

      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const mobileNavLinks = [
    { name: 'Home', href: '/' },
    { name: 'Members', href: '/members' },
    { name: 'Achievements', href: '/achievements' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Events', href: '/events' },
    { name: 'Register', href: '/register' },
    { name: 'Connect', href: '/contact' },
  ];

  return (
    <>
      {/* Desktop Navigation Bar (hidden on mobile/tablet below lg) */}
      <nav
        className={`hidden lg:block fixed left-1/2 -translate-x-1/2 w-[95%] max-w-5xl z-50 transition-all duration-300 h-[56px] ${
          isVisible ? 'top-0' : '-top-20'
        } ${
          isScrolled ? 'bg-[#111111]/95 backdrop-blur-md shadow-lg shadow-black/50' : 'bg-[#111111]/70 backdrop-blur-md'
        }`}
        style={{ clipPath: 'polygon(0 0, 100% 0, 96% 80%, 95.6% 92%, 94.8% 98%, 94% 100%, 6% 100%, 5.2% 98%, 4.4% 92%, 4% 80%)' }}
      >
        <div className="w-full h-full flex items-center justify-between px-12 relative">

          {/* Desktop Left Nav Items */}
          <div className="flex items-center justify-between flex-1 h-full pr-[14rem]">
            <NavIcon icon={Users} href="/members" tooltip="Members" isActive={location.pathname === '/members'} />
            <NavIcon icon={Award} href="/achievements" tooltip="Achievements" isActive={location.pathname === '/achievements'} />
            <NavIcon icon={ImageIcon} href="/gallery" tooltip="Media" isActive={location.pathname === '/gallery'} />
          </div>

          {/* Center Button (Greenovation/Home) */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 h-full w-80 lg:w-96 z-10">
            <Link
              to="/"
              data-tooltip="Home"
              className={`absolute inset-0 bg-valo-green flex items-center justify-center text-valo-bg font-display font-bold text-2xl tracking-widest uppercase hover:bg-[#ece8e1] hover:text-valo-bg transition-colors ${
                location.pathname === '/' ? 'ring-2 ring-white/20' : ''
              }`}
              style={{ clipPath: 'polygon(0 0, 100% 0, 80% 100%, 20% 100%)' }}
            >
              Greenovation
            </Link>
          </div>

          {/* Desktop Right Nav Items */}
          <div className="flex items-center justify-between flex-1 h-full pl-[14rem]">
            <NavIcon icon={Calendar} href="/events" tooltip="Events" isActive={location.pathname === '/events'} />
            <NavIcon icon={UserPlus} href="/register" tooltip="Register" isActive={location.pathname === '/register'} />
            <NavIcon icon={MessageSquare} href="/contact" tooltip="Connect" isActive={location.pathname === '/contact'} />
          </div>
        </div>
      </nav>

      {/* Standalone Mobile Hamburger Button (always sticks and stays visible) */}
      <button
        data-tooltip="Menu"
        aria-label="Toggle Navigation Menu"
        className="lg:hidden fixed top-5 right-5 z-50 w-11 h-11 flex items-center justify-center text-white bg-[#0e1613]/85 backdrop-blur-md border border-valo-green/40 clip-path-valo hover:text-valo-green hover:border-valo-green transition-all shadow-lg shadow-black/60"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={22} className="text-valo-green" /> : <Menu size={22} />}
      </button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-40 bg-valo-bg lg:hidden pt-28 px-8 flex flex-col justify-between pb-12"
          >
            <div className="flex flex-col gap-5">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-valo-green/60 mb-2">
                // NAVIGATION RELAY
              </span>
              {mobileNavLinks.map((link) => {
                const isCurrent = location.pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`text-3xl font-display font-bold uppercase tracking-tight transition-all flex items-center justify-between py-1 ${
                      isCurrent ? 'text-valo-green translate-x-2' : 'hover:text-valo-green text-white/80'
                    }`}
                  >
                    <span>{link.name}</span>
                    {isCurrent && (
                      <span className="w-2 h-2 rounded-full bg-valo-green shadow-[0_0_8px_#16ff8d]" />
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="border-t border-white/10 pt-6 font-mono text-[10px] text-white/30 uppercase tracking-widest">
              Greenovation Club // MSIT
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
