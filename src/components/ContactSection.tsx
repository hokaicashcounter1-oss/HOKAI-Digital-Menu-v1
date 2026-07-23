import { Phone, MessageSquare, Mail, MapPin, Globe, Clock, Calendar, ExternalLink, QrCode, Facebook, Instagram, Youtube, Twitter } from 'lucide-react';
import { ContactInfo } from '../types';

interface ContactSectionProps {
  contactInfo: ContactInfo;
}

export default function ContactSection({ contactInfo }: ContactSectionProps) {
  // Convert address to maps format
  const encodedAddress = encodeURIComponent(contactInfo.address || 'HOKAI Pan-Asian Kitchen');
  const mapIframeUrl = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

  const openingStr = contactInfo.openingTime || '12:00 PM';
  const closingStr = contactInfo.closingTime || '11:30 PM';
  const holidayStr = contactInfo.weeklyHoliday || 'None (Open All 7 Days)';

  return (
    <section id="contact" className="relative py-24 bg-[#121212] border-t border-white/5 overflow-hidden">
      {/* Contact Banner Backdrop Image if provided */}
      {contactInfo.contactBanner && (
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <img src={contactInfo.contactBanner} alt="" className="w-full h-full object-cover filter blur-sm" />
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 relative z-10">
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Contact Details Panel (6 Cols) */}
          <div className="lg:col-span-6 flex flex-col space-y-6">
            <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-8 rounded-2xl flex-1 flex flex-col justify-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-radial-gradient from-[#D4AF37]/5 to-transparent pointer-events-none" />
              
              <div className="flex items-center gap-4 mb-6">
                {contactInfo.logo ? (
                  <img src={contactInfo.logo} alt="Logo" className="w-12 h-12 rounded-full object-cover border border-[#D4AF37]/50" />
                ) : null}
                <div>
                  <h3 className="text-white text-2xl font-display tracking-wide">Contact Channels</h3>
                  <p className="text-white/40 text-xs uppercase tracking-wider">Direct Lines & Coordinates</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Phone Call */}
                <a 
                  href={`tel:${contactInfo.phone.replace(/[^0-9+]/g, '')}`} 
                  className="flex items-center justify-between p-3.5 rounded-xl bg-black/30 border border-white/5 hover:border-[#D4AF37]/50 hover:bg-white/5 transition-all group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-[#121212] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-white/50 text-[10px] uppercase tracking-wider font-sans">Phone Helpline</span>
                      <span className="text-white font-medium text-sm group-hover:text-[#D4AF37] transition-colors">{contactInfo.phone}</span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-[#D4AF37] transition-colors" />
                </a>

                {/* WhatsApp Chat */}
                <a 
                  href={`https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-black/30 border border-white/5 hover:border-[#D4AF37]/50 hover:bg-white/5 transition-all group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-[#121212] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-white/50 text-[10px] uppercase tracking-wider font-sans">WhatsApp Direct</span>
                      <span className="text-white font-medium text-sm group-hover:text-[#D4AF37] transition-colors">{contactInfo.whatsapp}</span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-[#D4AF37] transition-colors" />
                </a>

                {/* Email Address */}
                <a 
                  href={`mailto:${contactInfo.email}`}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-black/30 border border-white/5 hover:border-[#D4AF37]/50 hover:bg-white/5 transition-all group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-[#121212] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-white/50 text-[10px] uppercase tracking-wider font-sans">Email Inquiries</span>
                      <span className="text-white font-medium text-sm group-hover:text-[#D4AF37] transition-colors">{contactInfo.email}</span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-[#D4AF37] transition-colors" />
                </a>

                {/* Website */}
                {contactInfo.website && (
                  <a 
                    href={contactInfo.website.startsWith('http') ? contactInfo.website : `https://${contactInfo.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3.5 rounded-xl bg-black/30 border border-white/5 hover:border-[#D4AF37]/50 hover:bg-white/5 transition-all group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-[#121212] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block text-white/50 text-[10px] uppercase tracking-wider font-sans">Official Website</span>
                        <span className="text-white font-medium text-sm group-hover:text-[#D4AF37] transition-colors">{contactInfo.website}</span>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-[#D4AF37] transition-colors" />
                  </a>
                )}

                {/* Location Address */}
                <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-black/30 border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-[#121212] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-white/50 text-[10px] uppercase tracking-wider font-sans">Our Address</span>
                    <span className="text-white/80 text-sm leading-relaxed">{contactInfo.address}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Operating Hours & Holiday Card */}
            <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#121212] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-white/50 text-[10px] uppercase tracking-wider block font-sans">Operating Hours</span>
                  <span className="text-white font-bold text-sm block">{openingStr} – {closingStr}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-white/10 pt-3 sm:pt-0 sm:pl-6 w-full sm:w-auto">
                <div className="w-10 h-10 rounded-full bg-[#121212] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-white/50 text-[10px] uppercase tracking-wider block font-sans">Weekly Holiday</span>
                  <span className="text-[#D4AF37] font-semibold text-xs uppercase tracking-wider block">{holidayStr}</span>
                </div>
              </div>
            </div>

            {/* Social Channels Row */}
            <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-4 rounded-2xl flex items-center justify-between shadow-2xl">
              <span className="text-white/50 text-xs uppercase tracking-wider font-sans">Social Media Channels</span>
              <div className="flex items-center gap-3">
                {contactInfo.facebook && (
                  <a 
                    href={contactInfo.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-[#121212] hover:bg-[#D4AF37] hover:text-black border border-white/10 flex items-center justify-center text-white/80 transition-all"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {contactInfo.instagram && (
                  <a 
                    href={contactInfo.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-[#121212] hover:bg-[#D4AF37] hover:text-black border border-white/10 flex items-center justify-center text-white/80 transition-all"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {contactInfo.youtube && (
                  <a 
                    href={contactInfo.youtube} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-[#121212] hover:bg-[#D4AF37] hover:text-black border border-white/10 flex items-center justify-center text-white/80 transition-all"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                )}
                {contactInfo.twitter && (
                  <a 
                    href={contactInfo.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-[#121212] hover:bg-[#D4AF37] hover:text-black border border-white/10 flex items-center justify-center text-white/80 transition-all"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Map & QR Code Panel (6 Cols) */}
          <div className="lg:col-span-6 flex flex-col space-y-6">
            {/* Interactive Map Embed */}
            <div className="h-[320px] relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
              <iframe
                src={mapIframeUrl}
                className="absolute inset-0 w-full h-full border-0 filter invert-[90%] hue-rotate-[180deg] brightness-[88%] contrast-[100%]"
                allowFullScreen={true}
                loading="lazy"
                title="Google Maps Location"
                referrerPolicy="no-referrer-when-downgrade"
              />
              {contactInfo.googleMaps && (
                <a
                  href={contactInfo.googleMaps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-4 right-4 px-4 py-2 bg-[#0B0B0B]/90 hover:bg-[#D4AF37] text-white hover:text-black text-xs font-bold uppercase tracking-wider rounded-xl border border-white/10 backdrop-blur-md transition-all flex items-center gap-1.5 shadow-xl"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Open in Google Maps
                </a>
              )}
            </div>

            {/* QR Menu Card */}
            <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
              <div className="space-y-2 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 text-[#D4AF37]">
                  <QrCode className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-widest">Digital QR Menu</span>
                </div>
                <h4 className="text-white font-display text-lg">Scan to Access Mobile Menu</h4>
                <p className="text-white/50 text-xs max-w-xs leading-relaxed">
                  Scan directly with your smartphone camera to browse dishes on your mobile device instantly.
                </p>
              </div>

              <div className="shrink-0 p-3 bg-white rounded-2xl shadow-xl border border-white/20">
                <img 
                  src={contactInfo.qrCodeImage || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(window.location.href)}`} 
                  alt="QR Menu" 
                  className="w-28 h-28 object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
