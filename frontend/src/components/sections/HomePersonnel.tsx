import React, { useState, useEffect } from 'react';
import { Users, Award } from 'lucide-react';
import { Member } from '../../types';
import { SectionHeader } from '../ui/Shared';
import { MemberCard } from './MembersSection';

export const HomeAdvisorsSection: React.FC = () => {
  const [advisors, setAdvisors] = useState<Member[]>([]);

  useEffect(() => {
    fetch('/data/members.json')
      .then(res => res.json())
      .then((data: Member[]) => {
        setAdvisors(data.filter(m => m.category === 'faculty'));
      })
      .catch(err => console.error('Error fetching advisors:', err));
  }, []);

  if (advisors.length === 0) return null;

  return (
    <section id="faculty-unit" className="py-24 relative overflow-hidden bg-valo-dark/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(22,255,141,0.02),transparent_40%)] pointer-events-none" />
      <div className="container mx-auto px-6">
        <SectionHeader 
          number="01" 
          title="Faculty unit" 
          subtitle="Command Guidance" 
          icon={Users}
        />

        <div className="flex flex-wrap justify-center gap-3 sm:gap-6 md:gap-10 mt-12">
          {advisors.map(member => (
            <div key={member.id} className="w-[calc(33.333%-8px)] sm:w-[calc(50%-16px)] md:w-[calc(33.333%-27px)] lg:w-[calc(25%-30px)] max-w-sm">
              <MemberCard member={member} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const HomeFoundersSection: React.FC = () => {
  const [founders, setFounders] = useState<Member[]>([]);

  useEffect(() => {
    fetch('/data/members.json')
      .then(res => res.json())
      .then((data: Member[]) => {
        const roleRank: Record<string, number> = {
          'president': 1,
          'vice president': 2,
          'vice-president': 2,
          'secretary': 3,
          'joint secretary': 4,
          'treasurer': 5,
          'admin head': 6,
          'coordinator': 7,
          'executive lead': 8,
          'membership lead': 9,
          'membership co-lead': 10,
          'pr lead': 11,
          'creative lead': 12,
          'editor lead': 13,
          'club reporter': 14,
          'core member': 15,
        };

        const getRank = (role?: string) => {
          const clean = (role || '').toLowerCase().replace(/^former\s+/, '').trim();
          return roleRank[clean] !== undefined ? roleRank[clean] : 50;
        };

        const getTenureScore = (tenure?: string) => {
          if (!tenure) return 0;
          const match = tenure.match(/\d{4}/g);
          if (!match) return 0;
          const endYear = parseInt(match[match.length - 1], 10);
          const startYear = parseInt(match[0], 10);
          return endYear * 10000 + startYear;
        };

        const sortedFounders = data
          .filter(m => m.legacy === 'founder')
          .sort((a, b) => {
            // Older tenure first for founding members
            const tenureA = getTenureScore(a.tenure);
            const tenureB = getTenureScore(b.tenure);
            if (tenureA !== tenureB) return tenureA - tenureB;
            // Title rank (more important first)
            const rankA = getRank(a.role);
            const rankB = getRank(b.role);
            if (rankA !== rankB) return rankA - rankB;
            return a.name.localeCompare(b.name);
          });

        setFounders(sortedFounders);
      })
      .catch(err => console.error('Error fetching founders:', err));
  }, []);

  if (founders.length === 0) return null;

  return (
    <section id="founding-members" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(22,255,141,0.02),transparent_40%)] pointer-events-none" />
      <div className="container mx-auto px-6">
        <SectionHeader 
          number="02" 
          title="Founding Members" 
          subtitle="Club Origins" 
          icon={Award}
        />

        <div className="flex flex-wrap justify-center gap-3 sm:gap-6 md:gap-10 mt-12">
          {founders.map(member => (
            <div key={member.id} className="w-[calc(33.333%-8px)] sm:w-[calc(50%-16px)] md:w-[calc(33.333%-27px)] lg:w-[calc(25%-30px)] max-w-sm">
              <MemberCard member={member} forceActive={true} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
