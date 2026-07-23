import { Category, MenuItem, WebsiteContent } from './types';

// Zero fallback items or categories to ensure database state is strictly respected
export const fallbackCategories: Category[] = [];

export const fallbackMenuItems: MenuItem[] = [];

export const fallbackWebsiteContent: WebsiteContent = {
  restaurantName: 'HOKAI',
  restaurantSubtitle: 'Pan-Asian Kitchen',
  heroBanner: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop',
  aboutSection: 'HOKAI Pan-Asian Kitchen brings you an exquisite selection of culinary wonders from the vibrant heart of Asia. Nestled in a premium, ultra-modern luxury environment, our chefs synthesize fresh, local premium ingredients with traditional culinary methods. From masterfully crafted sushi and delicate steamed momos to high-fired wok specialties and royal Thai curries, HOKAI invites you on an unforgettable journey of gastronomic luxury.',
  contactInfo: {
    phone: '+1 (555) 732-8888',
    whatsapp: '15557328888',
    email: 'info@hokai-kitchen.com',
    website: 'https://hokai-kitchen.com',
    address: '888 Golden Dragon Blvd, Luxury Quarter, Suite 100',
    googleMaps: 'https://maps.google.com/?q=888+Golden+Dragon+Blvd,+Luxury+Quarter',
    openingTime: '12:00 PM',
    closingTime: '11:30 PM',
    weeklyHoliday: 'None (Open All 7 Days)',
    facebook: 'https://facebook.com/hokai.kitchen',
    instagram: 'https://instagram.com/hokai.kitchen',
    youtube: 'https://youtube.com',
    twitter: 'https://x.com',
    qrCodeImage: '',
    logo: '',
    contactBanner: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop'
  },
  gallery: [
    'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=600&auto=format&fit=crop'
  ]
};
