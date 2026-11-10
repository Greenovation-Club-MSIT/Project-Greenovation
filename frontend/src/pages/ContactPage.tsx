import React from 'react';
import { SectionHeader } from '../components/ui/Shared';
import { Mail, MapPin, MessageSquare, Phone, Linkedin, Instagram, Youtube } from 'lucide-react';

export const ContactPage: React.FC = () => {
  return (
    <div className="pt-24 min-h-screen pb-24">
      <div className="container mx-auto px-6 max-w-5xl">
        <SectionHeader 
          number="09" 
          title="Comms Relay" 
          subtitle="Contact Us" 
          icon={MessageSquare}
        />
        
        <div className="grid md:grid-cols-2 gap-12 mt-12">
          <div className="bg-valo-dark/50 p-8 clip-path-valo valo-border">
            <h3 className="text-2xl font-display font-bold uppercase tracking-widest text-valo-green mb-8">
              Headquarters
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <MapPin className="text-valo-green shrink-0 mt-1" />
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-white/50 mb-1">Location</div>
                  <div className="text-white">Meghnad Saha Institute of Technology<br/>Behind Urbana Complex Near,<br/>Ruby General Hospital,<br/>Anandapur Rd, Uchhepota,<br/>Kolkata, West Bengal 700150</div>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <Mail className="text-valo-green shrink-0 mt-1" />
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-white/50 mb-1">Email Relay</div>
                  <div className="text-white">greeninnovationclubmsit@gmail.com</div>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <Phone className="text-valo-green shrink-0 mt-1" />
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-white/50 mb-1">Direct Line</div>
                  <div className="text-white">+91 90643 06591</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-valo-dark/30 p-8 clip-path-valo border border-white/10 relative overflow-hidden flex flex-col justify-between">
             <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none select-none font-mono text-[8px] whitespace-pre">
               {`// DIGITAL_RELAYS\nSTATUS: ACTIVE`}
             </div>
             <div>
               <h3 className="text-2xl font-display font-bold uppercase tracking-widest text-valo-green mb-8">
                 Digital Channels
               </h3>
               
               <div className="space-y-6">
                 <div className="flex items-start gap-4">
                   <Linkedin className="text-valo-green shrink-0 mt-1" />
                   <div>
                     <div className="font-mono text-[10px] uppercase tracking-widest text-white/50 mb-1">LinkedIn Network</div>
                     <a 
                       href="https://www.linkedin.com/company/greenovation-club-meghnad-saha-institute-of-technology/" 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       className="text-white hover:text-valo-green transition-colors font-sans"
                     >
                       Greenovation Club MSIT
                     </a>
                   </div>
                 </div>
                 
                 <div className="flex items-start gap-4">
                   <Instagram className="text-valo-green shrink-0 mt-1" />
                   <div>
                     <div className="font-mono text-[10px] uppercase tracking-widest text-white/50 mb-1">Instagram Broadcast</div>
                     <a 
                       href="https://www.instagram.com/greenovation_msit/" 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       className="text-white hover:text-valo-green transition-colors font-sans"
                     >
                       @greenovation_msit
                     </a>
                   </div>
                 </div>

                 <div className="flex items-start gap-4">
                   <Youtube className="text-valo-green shrink-0 mt-1" />
                   <div>
                     <div className="font-mono text-[10px] uppercase tracking-widest text-white/50 mb-1">YouTube Transmission</div>
                     <a 
                       href="https://www.youtube.com/@GreenovationClubofMSIT" 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       className="text-white hover:text-valo-green transition-colors font-sans"
                     >
                       @GreenovationClubofMSIT
                     </a>
                   </div>
                 </div>
                 
                 <div className="flex items-start gap-4">
                   <MessageSquare className="text-valo-green shrink-0 mt-1" />
                   <div>
                     <div className="font-mono text-[10px] uppercase tracking-widest text-white/50 mb-1">WhatsApp Community</div>
                     <p className="text-white font-sans">
                       Join our announcement feeds via invite links shared during major induction drives.
                     </p>
                   </div>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
