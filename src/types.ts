export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  image: string;
  isVeg: boolean;
  isNonVeg: boolean;
  spiceLevel: number; // 0 to 3
  isDraft: boolean;
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
