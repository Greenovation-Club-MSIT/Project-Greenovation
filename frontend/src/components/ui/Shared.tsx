import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  number: string;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  coordinates?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ number, title, subtitle, icon: Icon, coordinates }) => {
  return (
    <div className="relative mb-12">
      <div className="flex items-end justify-between gap-4">
        <div className="flex items-end gap-2 md:gap-4 min-w-0">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-6xl sm:text-7xl md:text-9xl font-display font-bold text-valo-green/10 leading-none flex-shrink-0 select-none"
          >
            {number}
          </motion.span>
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="pb-1 md:pb-2 min-w-0"
          >
            <div className="flex items-center gap-2 mb-1">
              {Icon && <Icon size={16} className="text-valo-green md:w-5 md:h-5" />}
              <span className="text-valo-green font-mono text-xs md:text-sm tracking-[0.2em] uppercase">{subtitle || 'Initiative'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-6xl font-display font-bold uppercase tracking-tight leading-none break-words">
              {title}
            </h2>
          </motion.div>
        </div>

        {/* Sector Coordinates */}
        <div className="hidden sm:block pb-2 font-mono text-[9px] md:text-[10px] tracking-[0.25em] text-white/30 select-none shrink-0 uppercase">
          {coordinates || 'SEC://22.508°N 88.406°E'}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-valo-green/20" />
      <div className="absolute bottom-0 left-0 w-24 h-[1px] bg-valo-green" />
    </div>
  );
};

interface ValoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const ValoButton: React.FC<ValoButtonProps> = ({ variant = 'primary', size = 'md', children, className, ...props }) => {
  const baseStyles = "relative font-display font-bold uppercase tracking-widest transition-all duration-200 clip-path-valo active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group hover:scale-105";
  
  const variants = {
    primary: "bg-valo-green text-valo-bg hover:bg-white hover:text-valo-bg",
    secondary: "bg-valo-red text-white hover:bg-white hover:text-valo-bg",
    outline: "border border-valo-green text-valo-green hover:bg-valo-green/10",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-8 py-3 text-sm",
    lg: "px-10 py-4 text-base",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
      {/* Accent corner effect */}
      <div className="absolute top-0 right-0 w-2 h-2 bg-current opacity-30 group-hover:opacity-100 transition-opacity" />
    </button>
  );
};
