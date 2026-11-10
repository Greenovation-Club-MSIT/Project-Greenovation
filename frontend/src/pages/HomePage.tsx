import React from 'react';
import { Hero } from '../components/sections/Hero';
import { AboutSection } from '../components/sections/AboutSection';
import { HomeAdvisorsSection, HomeFoundersSection } from '../components/sections/HomePersonnel';

export const HomePage: React.FC = () => {
  return (
    <div className="pt-0">
      <Hero />
      <AboutSection />
      <HomeAdvisorsSection />
      <HomeFoundersSection />
    </div>
  );
};
