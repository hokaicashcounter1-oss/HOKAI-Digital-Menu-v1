export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface VerifiedImage {
  url: string;
  foodMatchScore: number; // 0 - 100
  realPhotoScore: number; // 0 - 100
  descriptionMatchScore: number; // 0 - 100
  isVerified: boolean; // foodMatch >= 90 && realPhoto >= 90 && descriptionMatch >= 85
  verificationNote?: string;
  isCustomDish?: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  image: string;
  images?: string[]; // Up to 5 premium multi-angle images
  verifiedImages?: VerifiedImage[];
  isCustomDish?: boolean;
  photoMessage?: string;
  isVeg: boolean;
  isNonVeg: boolean;
  spiceLevel: number; // 0: None, 1: Mild, 2: Medium, 3: Spicy, 4: Very Spicy, 5: Extreme Spicy
  isDraft: boolean;
}

export interface SpiceConfig {
  level: number;
  label: string;
  shortLabel: string;
  chilies: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

export const SPICE_LEVEL_CONFIGS: Record<number, SpiceConfig> = {
  0: {
    level: 0,
    label: 'Not Spicy',
    shortLabel: 'Non-Spicy',
    chilies: '',
    badgeBg: 'bg-emerald-950/30',
    badgeText: 'text-emerald-400',
    badgeBorder: 'border-emerald-500/20'
  },
  1: {
    level: 1,
    label: 'Mild',
    shortLabel: 'Mild',
    chilies: '🌶️',
    badgeBg: 'bg-amber-950/30',
    badgeText: 'text-amber-400',
    badgeBorder: 'border-amber-500/30'
  },
  2: {
    level: 2,
    label: 'Medium',
    shortLabel: 'Medium',
    chilies: '🌶️🌶️',
    badgeBg: 'bg-orange-950/30',
    badgeText: 'text-orange-400',
    badgeBorder: 'border-orange-500/30'
  },
  3: {
    level: 3,
    label: 'Spicy',
    shortLabel: 'Spicy',
    chilies: '🌶️🌶️🌶️',
    badgeBg: 'bg-red-950/40',
    badgeText: 'text-red-400',
    badgeBorder: 'border-red-500/40'
  },
  4: {
    level: 4,
    label: 'Very Spicy',
    shortLabel: 'Very Spicy',
    chilies: '🌶️🌶️🌶️🌶️',
    badgeBg: 'bg-rose-950/50',
    badgeText: 'text-rose-400',
    badgeBorder: 'border-rose-500/50'
  },
  5: {
    level: 5,
    label: 'Extreme Spicy',
    shortLabel: 'Extreme',
    chilies: '🌶️🌶️🌶️🌶️🌶️',
    badgeBg: 'bg-purple-950/60',
    badgeText: 'text-purple-300',
    badgeBorder: 'border-purple-500/60'
  }
};

export function getSpiceConfig(level: number = 0): SpiceConfig {
  const normalized = Math.min(Math.max(Math.round(level), 0), 5);
  return SPICE_LEVEL_CONFIGS[normalized] || SPICE_LEVEL_CONFIGS[0];
}

export interface ContactInfo {
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  googleMaps: string;
  facebook: string;
  instagram: string;
}

export interface WebsiteContent {
  restaurantName?: string;
  restaurantSubtitle?: string;
  heroBanner: string;
  aboutSection: string;
  contactInfo: ContactInfo;
  gallery: string[];
}
