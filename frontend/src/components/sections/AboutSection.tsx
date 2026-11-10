import React from 'react';

export const AboutSection: React.FC = () => {
  return (
    <section className="py-24 bg-valo-dark/20 relative overflow-hidden" id="about">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="absolute -top-10 -left-10 text-9xl font-display font-bold text-valo-green/5 select-none">
              INIT
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tight mb-8">
              Rewriting the <br />
              <span className="text-valo-green">Eco-System Code</span>
            </h2>
            <div className="space-y-6 text-gray-400 text-lg leading-relaxed max-w-xl">
              <p>
                The Greenovation Club transforms environmental ideas into tangible community actions.
                From engineering student-led innovations and sustainable tech prototypes to driving large-scale 
                cleanliness and ecological drives, the club instills a proactive, forward-thinking mindset in its members.
              </p>
              <p>
                Beyond its environmental mission, the organization serves as a catalyst for individual growth 
                and professional development. Through real-world project deployments, collaborative workshops, 
                and purposeful initiatives, students expand their networks, cultivate leadership abilities, 
                and engineer sustainable solutions that contribute to the green progress of the nation.
              </p>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute inset-0 bg-valo-green/10 clip-path-valo blur-3xl group-hover:bg-valo-green/20 transition-all" />
            <div className="relative bg-valo-dark p-2 clip-path-valo valo-border">
              <img
                src="/images/gallery/DSC03354.JPG.jpeg"
                className="w-full h-full object-cover clip-path-valo transition-all duration-700 hover:scale-105"
                alt="Greenovation Initiatives"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
