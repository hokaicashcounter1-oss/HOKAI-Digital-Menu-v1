import { Phone, MessageSquare, Mail, MapPin, Share2, Facebook, Instagram } from 'lucide-react';
import { ContactInfo } from '../types';

interface ContactSectionProps {
  contactInfo: ContactInfo;
}

export default function ContactSection({ contactInfo }: ContactSectionProps) {
  // Convert address to maps format
  const encodedAddress = encodeURIComponent(contactInfo.address);
  const mapIframeUrl = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

  return (
    <section id="contact" className="relative py-24 bg-[#121212] border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-6 h-[1px] bg-[#D4AF37]/60" />
            <span className="text-sm font-sans tracking-[0.3em] uppercase text-[#D4AF37]">Hours & Directions</span>
            <span className="w-6 h-[1px] bg-[#D4AF37]/60" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold font-display text-white tracking-wide">
            Reserve Your Experience
          </h2>
        </div>

        {/* Contact Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          {/* Contact Details Panel (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
            <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-8 rounded-2xl flex-1 flex flex-col justify-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-radial-gradient from-[#D4AF37]/5 to-transparent pointer-events-none" />
              
              <h3 className="text-white text-2xl font-display tracking-wide mb-6">Contact Channels</h3>
              
              <div className="space-y-6">
                {/* Phone Call */}
                <a 
                  href={`tel:${contactInfo.phone.replace(/[^0-9+]/g, '')}`} 
                  className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#121212] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black transition-all duration-300">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-white/50 text-xs uppercase tracking-wider font-sans">Phone Helpline</span>
                    <span className="text-white font-medium group-hover:text-[#D4AF37] transition-colors">{contactInfo.phone}</span>
                  </div>
                </a>

                {/* WhatsApp Chat */}
                <a 
                  href={`https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#121212] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black transition-all duration-300">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-white/50 text-xs uppercase tracking-wider font-sans">WhatsApp Direct</span>
                    <span className="text-white font-medium group-hover:text-[#D4AF37] transition-colors">Start Instant Chat</span>
                  </div>
                </a>

                {/* Email Address */}
                <a 
                  href={`mailto:${contactInfo.email}`}
                  className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#121212] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black transition-all duration-300">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-white/50 text-xs uppercase tracking-wider font-sans">Email Inquiries</span>
                    <span className="text-white font-medium group-hover:text-[#D4AF37] transition-colors">{contactInfo.email}</span>
                  </div>
                </a>

                {/* Location Address */}
                <div className="flex items-start gap-4 p-3 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-[#121212] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-white/50 text-xs uppercase tracking-wider font-sans">Our Address</span>
                    <span className="text-white/80 text-sm leading-relaxed">{contactInfo.address}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Social & Timings Panel */}
            <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-6 rounded-2xl flex justify-between items-center shadow-2xl">
              <div>
                <span className="text-white/50 text-xs uppercase tracking-wider block mb-2 font-sans">Social Channels</span>
                <div className="flex gap-4">
                  <a 
                    href={contactInfo.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-[#121212] hover:bg-[#D4AF37] hover:text-black border border-white/5 flex items-center justify-center text-white/80 transition-all duration-300"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                  <a 
                    href={contactInfo.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-[#121212] hover:bg-[#D4AF37] hover:text-black border border-white/5 flex items-center justify-center text-white/80 transition-all duration-300"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                </div>
              </div>
              
              <div className="text-right border-l border-white/5 pl-6">
                <span className="text-white/50 text-xs uppercase tracking-wider block mb-1 font-sans">Operating Hours</span>
                <span className="text-white font-medium block text-sm">Mon - Sun</span>
                <span className="text-[#D4AF37] text-xs uppercase tracking-[0.1em] font-sans">12:00 PM - 11:30 PM</span>
              </div>
            </div>
          </div>

          {/* Interactive Google Map embed (7 Cols) */}
          <div className="lg:col-span-7 h-[350px] lg:h-auto min-h-[350px] relative rounded-2xl overflow-hidden border border-white/5 shadow-xl">
            <iframe
              src={mapIframeUrl}
              className="absolute inset-0 w-full h-full border-0 filter invert-[90%] hue-rotate-[180deg] brightness-[88%] contrast-[100%]"
              allowFullScreen={true}
              loading="lazy"
              title="Google Maps Location"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
