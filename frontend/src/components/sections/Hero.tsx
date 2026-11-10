import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { ValoButton } from '../ui/Shared';
import { Link } from 'react-router-dom';

export const Hero: React.FC = () => {
  const orbitKeyframes = React.useMemo(() => {
    const steps = 60;
    
    // Ellipse A (vertical)
    const rxA = 228;
    const ryA = 326;
    
    // Ellipse B (horizontal - interchanged axes)
    const rxB = 326;
    const ryB = 228;
    
    const x1: number[] = [];
    const y1: number[] = [];
    const x2: number[] = [];
    const y2: number[] = [];
    const x3: number[] = [];
    const y3: number[] = [];
    const x4: number[] = [];
    const y4: number[] = [];
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      
      // Bubble 1 (starts at theta = 0, Ellipse A)
      const theta1 = t * 2 * Math.PI;
      x1.push(rxA * Math.cos(theta1));
      y1.push(ryA * Math.sin(theta1));
      
      // Bubble 2 (starts offset by 0.25, Ellipse B)
      const t2 = (t + 0.25) % 1;
      const theta2 = t2 * 2 * Math.PI;
      x2.push(rxB * Math.cos(theta2));
      y2.push(ryB * Math.sin(theta2));

      // Bubble 3 (starts offset by 0.5, Ellipse A)
      const t3 = (t + 0.5) % 1;
      const theta3 = t3 * 2 * Math.PI;
      x3.push(rxA * Math.cos(theta3));
      y3.push(ryA * Math.sin(theta3));

      // Bubble 4 (starts offset by 0.75, Ellipse B)
      const t4 = (t + 0.75) % 1;
      const theta4 = t4 * 2 * Math.PI;
      x4.push(rxB * Math.cos(theta4));
      y4.push(ryB * Math.sin(theta4));
    }
    
    return { x1, y1, x2, y2, x3, y3, x4, y4 };
  }, []);

  return (
    <section id="home" className="relative h-screen flex items-center pt-20 z-30">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-2/3 h-full bg-valo-green/5 clip-path-valo-inv translate-x-20" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-valo-green/5 clip-path-valo -translate-x-20" />
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="h-full w-full bg-[linear-gradient(rgba(22,255,141,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(22,255,141,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>
      </div>

      <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="hidden md:inline-flex items-center gap-3 px-6 py-2 bg-valo-green/10 border border-valo-green/20 rounded-full mt-12 mb-8">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-valo-green">Next Generation Sustainability</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-display font-bold uppercase leading-[0.9] tracking-tighter mb-6">
            Leading the <br />
            <span className="text-valo-green italic">Future</span> of <br />
            Eco-Action
          </h1>

          <p className="text-gray-400 text-lg max-w-lg mb-10 leading-relaxed font-sans">
            Greenovation Club is a hub for environmental pioneers. We blend futuristic
            design with real-world sustainability to create a greener tomorrow today.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link to="/register">
              <ValoButton size="lg" data-tooltip="Join the Club">Join the Frontline <ArrowRight size={18} className="ml-1" /></ValoButton>
            </Link>
            <Link to="/events">
              <ValoButton variant="outline" size="lg" data-tooltip="View Events">Explore Missions</ValoButton>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative hidden lg:block"
        >
          <div className="relative z-10 w-full aspect-square max-w-md mx-auto flex items-center justify-center">
            {/* Visual aesthetic elements */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
              className="absolute inset-0 border-[10px] border-white/5 rounded-full"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
              className="absolute inset-0 border border-valo-green/30 rounded-full"
            />
            <div className="w-4/5 h-4/5 bg-white rounded-full shadow-2xl relative overflow-hidden flex items-center justify-center border-4 border-valo-green/50">
              <img
                src="/assets/logo.png"
                className="w-[calc(100%-17px)] h-[calc(100%-17px)] relative translate-y-[5px] translate-x-[1px] object-contain scale-[1.18] hover:scale-[1.28] transition-transform duration-500"
                alt="Greenovation Club Logo"
              />
            </div>
            {/* Top Right / Orbiting Bubble 1 (SwitchOn Logo) */}
            <motion.div
              animate={{
                x: orbitKeyframes.x1,
                y: orbitKeyframes.y1,
              }}
              transition={{
                repeat: Infinity,
                duration: 15,
                ease: "linear",
              }}
              className="absolute w-24 h-24 bg-white rounded-full shadow-lg overflow-hidden flex items-center justify-center border-2 border-valo-green/40 z-50 cursor-pointer"
            >
              <img
                src="/assets/switchon_logo.png"
                className="w-full h-full object-contain p-2"
                alt="SwitchOn Logo"
              />
            </motion.div>
            {/* Bottom Left / Orbiting Bubble 2 (IIC Logo) */}
            <motion.div
              animate={{
                x: orbitKeyframes.x2,
                y: orbitKeyframes.y2,
              }}
              transition={{
                repeat: Infinity,
                duration: 15,
                ease: "linear",
              }}
              className="absolute w-24 h-24 bg-white rounded-full shadow-lg overflow-hidden flex items-center justify-center border-2 border-valo-green/40 z-50 cursor-pointer"
            >
              <img
                src="/assets/iic_logo.png"
                className="w-full h-full object-contain p-2"
                alt="IIC Logo"
              />
            </motion.div>
            {/* Orbiting Bubble 3 (MSIT Logo) */}
            <motion.div
              animate={{
                x: orbitKeyframes.x3,
                y: orbitKeyframes.y3,
              }}
              transition={{
                repeat: Infinity,
                duration: 15,
                ease: "linear",
              }}
              className="absolute w-24 h-24 bg-white rounded-full shadow-lg overflow-hidden flex items-center justify-center border-2 border-valo-green/40 z-50 cursor-pointer"
            >
              <img
                src="/assets/msit_logo.png"
                className="w-full h-full object-contain p-2"
                alt="MSIT Logo"
              />
            </motion.div>
            {/* Orbiting Bubble 4 (SDG Logo) */}
            <motion.div
              animate={{
                x: orbitKeyframes.x4,
                y: orbitKeyframes.y4,
              }}
              transition={{
                repeat: Infinity,
                duration: 15,
                ease: "linear",
              }}
              className="absolute w-24 h-24 bg-white rounded-full shadow-lg overflow-hidden flex items-center justify-center border-2 border-valo-green/40 z-50 cursor-pointer"
            >
              <img
                src="/assets/sdg_logo.png"
                className="w-full h-full object-contain p-2"
                alt="SDG Logo"
              />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Aesthetic Side Rails */}
      <div className="absolute left-6 bottom-12 hidden md:flex flex-col gap-8 opacity-20">
        <div className="h-24 w-[1px] bg-white mx-auto" />
        <span className="font-mono text-[10px] tracking-widest uppercase [writing-mode:vertical-rl] rotate-180">Established 2023</span>
      </div>
    </section>
  );
};
