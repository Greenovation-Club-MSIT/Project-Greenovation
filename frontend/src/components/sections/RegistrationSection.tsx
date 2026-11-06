import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserPlus, Send, CheckCircle } from 'lucide-react';
import { SectionHeader, ValoButton } from '../ui/Shared';

export const RegistrationSection: React.FC = () => {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('submitting');
    setTimeout(() => setFormState('success'), 1500);
  };

  const InputField = ({ label, id, type = "text", placeholder, required = true }: any) => (
    <div className="mb-6">
      <label htmlFor={id} className="block font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2">
        {label} {required && <span className="text-valo-red">*</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        required={required}
        className="w-full bg-valo-dark/50 border border-white/10 px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-valo-green transition-colors clip-path-valo"
      />
    </div>
  );

  return (
    <section id="register" className="py-24 relative">
      <div className="container mx-auto px-6 max-w-4xl">
        <SectionHeader
          number="07"
          title="Personnel Intake"
          subtitle="Registration"
          icon={UserPlus}
        />

        <div className="bg-[#0b1411] p-10 md:p-16 clip-path-valo valo-border relative overflow-hidden">
          {/* Aesthetic background code blurbs */}
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none select-none font-mono text-[8px] whitespace-pre">
            {`// PROTOCOL_ENROLLMENT_v4.2\nAUTH_KEY: GREEN_INIT\nLEVEL: ECO_CERTIFIED`}
          </div>

          {/* Coming Soon Overlay */}
          <div className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-center select-none overflow-hidden">
            {/* Center tactical badge/stamp */}
            <div className="relative z-10 px-8 py-5 border-2 border-valo-green/60 bg-[#0d1210]/90 backdrop-blur-md clip-path-valo shadow-2xl shadow-black/80 flex flex-col items-center text-center max-w-sm mx-4">
              <span className="font-mono text-[10px] md:text-xs tracking-[0.35em] uppercase text-valo-green mb-1 font-bold">
                // INTAKE PROTOCOL LOCKED //
              </span>
              <span className="text-3xl md:text-5xl font-display font-extrabold uppercase tracking-widest text-white drop-shadow-[0_0_12px_rgba(22,255,141,0.5)]">
                COMING SOON
              </span>
              <p className="font-mono text-[11px] text-gray-400 mt-2 uppercase tracking-wider">
                Recruitment window is currently closed.
              </p>
            </div>
          </div>

          {/* Grayed out & disabled form container with green duotone cast */}
          <div className="opacity-45 pointer-events-none select-none [filter:grayscale(1)_sepia(0.6)_hue-rotate(90deg)_saturate(2)]">
            {formState === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="bg-valo-green/20 w-24 h-24 flex items-center justify-center rounded-full mx-auto mb-8 animate-pulse">
                <CheckCircle size={48} className="text-valo-green" />
              </div>
              <h3 className="text-4xl font-display font-bold uppercase tracking-tight mb-4">Registration Transmitted</h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Your application has been received by the core command. We will contact you soon via the provided coordinates.
              </p>
              <ValoButton onClick={() => setFormState('idle')} data-tooltip="Register Again">Register Another</ValoButton>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-x-8">
                <InputField label="Full Name" id="name" placeholder="Agent Name" />
                <InputField label="Email Address" id="email" type="email" placeholder="agent@domain.com" />
                <InputField label="Phone Number" id="phone" placeholder="+91 00000 00000" />
                <InputField label="Department / Year" id="department" placeholder="Eng / 2nd Year" />
              </div>

              <div className="mb-8">
                <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 mb-3">Primary Interests</label>
                <div className="flex flex-wrap gap-3">
                  {['Renewable Energy', 'Waste Mgmt', 'Urban Farming', 'Policy & Outreach', 'Tech R&D'].map(tag => (
                    <label key={tag} className="group cursor-pointer">
                      <input type="checkbox" className="hidden peer" />
                      <div className="px-4 py-2 border border-white/10 text-xs font-display uppercase tracking-widest bg-white/5 peer-checked:bg-valo-green peer-checked:text-valo-bg peer-checked:border-valo-green transition-all hover:bg-white/10">
                        {tag}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-10">
                <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2">Statement of Intent</label>
                <textarea
                  rows={4}
                  className="w-full bg-valo-dark/50 border border-white/10 px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-valo-green transition-colors clip-path-valo resize-none"
                  placeholder="Why do you want to join Greenovation?"
                ></textarea>
              </div>

              <ValoButton
                type="submit"
                className="w-full"
                disabled={true}
                data-tooltip="Available during recruitment periods"
              >
                Transmit Application
                <Send size={18} className="ml-2" />
              </ValoButton>
            </form>
          )}
          </div>
        </div>
      </div>
    </section>
  );
};
