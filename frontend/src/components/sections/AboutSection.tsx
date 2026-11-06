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
                src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1000&auto=format&fit=crop"
                className="w-full h-full object-cover clip-path-valo grayscale hover:grayscale-0 transition-all duration-700"
                alt="Innovation Lab"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-valo-bg/80 backdrop-blur-md clip-path-valo border border-white/10">
                <div className="font-mono text-[8px] text-white/40 uppercase mb-1">Asset Trace</div>
                <div className="text-xs font-bold uppercase tracking-widest">ECO-SYS-FACILITY-01</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
