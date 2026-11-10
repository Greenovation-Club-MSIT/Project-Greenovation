import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Twitter, Linkedin, Github, Instagram, Globe, Mail, Facebook, Youtube, Users } from 'lucide-react';
import { Member } from '../../types';
import { SectionHeader } from '../ui/Shared';

const socialIconMap: Record<string, React.FC<any>> = {
  linkedin: Linkedin,
  twitter: Twitter,
  github: Github,
  instagram: Instagram,
  globe: Globe,
  mail: Mail,
  facebook: Facebook,
  youtube: Youtube
};

export interface MemberCardProps {
  member: Member;
  forceActive?: boolean;
  hideDetails?: boolean;
}

export const MemberCard: React.FC<MemberCardProps> = ({ member, forceActive, hideDetails }) => {
  const isPast = member.category === 'past' && !forceActive;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="group relative"
    >
      <div className={`relative aspect-square overflow-hidden clip-path-valo valo-border ${isPast ? 'opacity-80 group-hover:opacity-100 group-hover:valo-border-active' : 'group-hover:valo-border-active'} transition-all`}>
        <img 
          src={member.image} 
          alt={member.name}
          className={`w-full h-full object-cover ${isPast ? 'grayscale group-hover:grayscale-0' : ''} transition-all duration-500`}
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-valo-bg via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
      </div>

      <div className="mt-2 sm:mt-6">
        <h4 className={`text-xs sm:text-lg md:text-xl font-display font-bold uppercase tracking-tight mb-0.5 sm:mb-1 truncate ${isPast ? 'text-white/40 group-hover:text-valo-green' : 'group-hover:text-valo-green'} transition-colors`}>
          {member.name}
        </h4>
        {!hideDetails && (
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mt-1 sm:mt-2 min-h-0 sm:min-h-[32px]">
            <div className="flex flex-col justify-center sm:pr-2">
              {member.role && (
                <p className="text-[9px] sm:text-xs font-mono uppercase tracking-wider sm:tracking-widest text-valo-green/60 truncate">
                  {member.role}
                </p>
              )}
              {member.tenure && (
                <p className="text-[8px] sm:text-[10px] font-mono tracking-wider sm:tracking-widest text-white/40 mt-0.5">
                  {member.tenure}
                </p>
              )}
            </div>
            
            <div className={`hidden sm:flex gap-2 shrink-0 mt-1 sm:mt-0 ${isPast ? 'opacity-80 group-hover:opacity-100' : 'opacity-100'} transition-opacity`}>
              {member.socials && Object.entries(member.socials).map(([platform, url]) => {
                const IconComponent = socialIconMap[platform.toLowerCase()];
                if (!IconComponent || !url) return null;
                return (
                  <a 
                    key={platform} 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-valo-green hover:text-valo-green transition-all"
                  >
                    <IconComponent size={14} />
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const MembersSection: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    fetch('/data/members.json')
      .then(res => res.json())
      .then(data => setMembers(data))
      .catch(err => console.error('Error fetching members data:', err));
  }, []);

  const coreMembers = members.filter(m => m.category === 'core');
  const executives = members.filter(m => m.category === 'executive');
  const advisors = members.filter(m => m.category === 'advisor');
  const pastMembers = members.filter(m => m.category === 'past');

  return (
    <section id="members" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <SectionHeader 
          number="03" 
          title="The Vanguard" 
          subtitle="Club Personnel" 
          icon={Users}
        />

        <div className="mb-24">
          <div className="flex items-center gap-6 py-6 mb-10">
            <h3 className="text-xl md:text-2xl font-display font-bold tracking-[0.2em] uppercase text-valo-green/90">
              Tier 1: Core Command
            </h3>
            <div className="flex-1 h-[1px] bg-gradient-to-r from-valo-green/30 to-transparent" />
          </div>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-6 md:gap-10">
            {coreMembers.map(member => (
              <div key={member.id} className="w-[calc(33.333%-8px)] sm:w-[calc(50%-16px)] md:w-[calc(33.333%-27px)] lg:w-[calc(25%-30px)] max-w-sm">
                <MemberCard member={member} />
              </div>
            ))}
          </div>
        </div>

        <div className="mb-24">
          <div className="flex items-center gap-6 py-6 mb-10">
            <h3 className="text-xl md:text-2xl font-display font-bold tracking-[0.2em] uppercase text-valo-green/90">
              Tier 2: Advisory Unit
            </h3>
            <div className="flex-1 h-[1px] bg-gradient-to-r from-valo-green/30 to-transparent" />
          </div>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-6 md:gap-10">
            {advisors.map(member => (
              <div key={member.id} className="w-[calc(33.333%-8px)] sm:w-[calc(50%-16px)] md:w-[calc(33.333%-27px)] lg:w-[calc(25%-30px)] max-w-sm">
                <MemberCard member={member} />
              </div>
            ))}
          </div>
        </div>

        <div className="mb-24">
          <div className="flex items-center gap-6 py-6 mb-10">
            <h3 className="text-xl md:text-2xl font-display font-bold tracking-[0.2em] uppercase text-valo-green/90">
              Tier 3: Executive Unit
            </h3>
            <div className="flex-1 h-[1px] bg-gradient-to-r from-valo-green/30 to-transparent" />
          </div>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-6 md:gap-10">
            {executives.map(member => (
              <div key={member.id} className="w-[calc(33.333%-8px)] sm:w-[calc(50%-16px)] md:w-[calc(33.333%-27px)] lg:w-[calc(25%-30px)] max-w-sm">
                <MemberCard member={member} />
              </div>
            ))}
          </div>
        </div>

        {pastMembers.length > 0 && (
          <div className="mb-24">
            <div className="flex items-center gap-6 py-6 mb-10">
              <h3 className="text-xl md:text-2xl font-display font-bold tracking-[0.2em] uppercase text-valo-green/90">
                Legacy: Past Members
              </h3>
              <div className="flex-1 h-[1px] bg-gradient-to-r from-valo-green/30 to-transparent" />
            </div>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-6 md:gap-10">
              {pastMembers.map(member => (
                <div key={member.id} className="w-[calc(33.333%-8px)] sm:w-[calc(50%-16px)] md:w-[calc(33.333%-27px)] lg:w-[calc(25%-30px)] max-w-sm">
                  <MemberCard member={member} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
