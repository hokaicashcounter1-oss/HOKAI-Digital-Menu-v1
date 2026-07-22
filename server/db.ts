import fs from 'fs';
import path from 'path';

// Define DB Types
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
  images?: string[]; // Array of 5 photography angles/views
  verifiedImages?: any[];
  isCustomDish?: boolean;
  photoMessage?: string;
  isVeg: boolean;
  isNonVeg: boolean;
  spiceLevel: number; // 0 to 5
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
  heroBanner: string;
  aboutSection: string;
  contactInfo: ContactInfo;
  gallery: string[];
}

export interface DatabaseSchema {
  categories: Category[];
  menuItems: MenuItem[];
  websiteContent: WebsiteContent;
  adminSettings: {
    adminId: string;
    passwordHash: string; // Plain-text or simple base64 is fine for this app
  };
}

const DB_PATH = path.join(process.cwd(), 'menu_db.json');

// High-quality Initial Data
const initialCategories: Category[] = [
  { id: 'cat-soups', name: 'Soups', slug: 'soups' },
  { id: 'cat-starters', name: 'Starters', slug: 'starters' },
  { id: 'cat-momos', name: 'Momos', slug: 'momos' },
  { id: 'cat-sushi', name: 'Sushi', slug: 'sushi' },
  { id: 'cat-noodles', name: 'Noodles', slug: 'noodles' },
  { id: 'cat-rice', name: 'Rice', slug: 'rice' },
  { id: 'cat-main-course', name: 'Main Course', slug: 'main-course' },
  { id: 'cat-desserts', name: 'Desserts', slug: 'desserts' },
  { id: 'cat-beverages', name: 'Beverages', slug: 'beverages' }
];

const initialMenuItems: MenuItem[] = [
  // Soups
  {
    id: 'soup-1',
    name: 'Tom Yum Goong',
    description: 'A classic spicy and sour Thai soup cooked with fresh prawns, lemongrass, kaffir lime leaves, galangal, and red chilies.',
    price: 345,
    categoryId: 'cat-soups',
    image: 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?q=80&w=600&auto=format&fit=crop',
    isVeg: false,
    isNonVeg: true,
    spiceLevel: 3,
    isDraft: false
  },
  {
    id: 'soup-2',
    name: 'Wild Mushroom Tom Kha',
    description: 'Silky and aromatic coconut milk soup infused with fresh lemongrass, galangal, kaffir lime, and exotic wild mushrooms.',
    price: 310,
    categoryId: 'cat-soups',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=600&auto=format&fit=crop',
    isVeg: true,
    isNonVeg: false,
    spiceLevel: 1,
    isDraft: false
  },
  // Starters
  {
    id: 'starter-1',
    name: 'Wasabi Rock Prawns',
    description: 'Crispy tempura fried rock prawns tossed in a velvety, sweet and spicy wasabi mayonnaise, topped with black sesame.',
    price: 525,
    categoryId: 'cat-starters',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=600&auto=format&fit=crop',
    isVeg: false,
    isNonVeg: true,
    spiceLevel: 1,
    isDraft: false
  },
  {
    id: 'starter-2',
    name: 'Crispy Chili Babycorn & Lotus Root',
    description: 'Crunchy baby corn and sliced lotus root tossed with diced bell peppers, spring onions, and premium dark chili sauce.',
    price: 415,
    categoryId: 'cat-starters',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop',
    isVeg: true,
    isNonVeg: false,
    spiceLevel: 2,
    isDraft: false
  },
  // Momos
  {
    id: 'momo-1',
    name: 'Truffle Edamame & Cheese Dumpling',
    description: 'Exquisite dumplings filled with crushed edamame, cream cheese, and a delicate drizzle of black truffle oil.',
    price: 485,
    categoryId: 'cat-momos',
    image: 'https://images.unsplash.com/photo-1496116211217-41af19539021?q=80&w=600&auto=format&fit=crop',
    isVeg: true,
    isNonVeg: false,
    spiceLevel: 0,
    isDraft: false
  },
  {
    id: 'momo-2',
    name: 'Classic Steamed Crystal Chicken Momo',
    description: 'Translucent skin dumplings stuffed with finely minced chicken, ginger, scallions, served with our signature firecracker chili sauce.',
    price: 425,
    categoryId: 'cat-momos',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=600&auto=format&fit=crop',
    isVeg: false,
    isNonVeg: true,
    spiceLevel: 1,
    isDraft: false
  },
  // Sushi
  {
    id: 'sushi-1',
    name: 'Hokai Signature Dragon Roll',
    description: 'Uramaki sushi with crispy prawn tempura and cucumber inside, draped with layers of ripe avocado, unagi eel sauce, and spicy mayo.',
    price: 695,
    categoryId: 'cat-sushi',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=600&auto=format&fit=crop',
    isVeg: false,
    isNonVeg: true,
    spiceLevel: 1,
    isDraft: false
  },
  {
    id: 'sushi-2',
    name: 'Avocado Cucumber Cream Cheese Roll',
    description: 'Delicate sushi roll filled with Hass avocado slices, crisp English cucumber, and rich cream cheese, toasted with toasted sesame.',
    price: 545,
    categoryId: 'cat-sushi',
    image: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?q=80&w=600&auto=format&fit=crop',
    isVeg: true,
    isNonVeg: false,
    spiceLevel: 0,
    isDraft: false
  },
  // Noodles
  {
    id: 'noodles-1',
    name: 'Traditional Shrimp Pad Thai',
    description: 'Flat rice noodles stir-fried in a tangy tamarind sauce with fresh prawns, firm tofu, egg, bean sprouts, and crushed roasted peanuts.',
    price: 495,
    categoryId: 'cat-noodles',
    image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?q=80&w=600&auto=format&fit=crop',
    isVeg: false,
    isNonVeg: true,
    spiceLevel: 1,
    isDraft: false
  },
  {
    id: 'noodles-2',
    name: 'Hakka Chili Garlic Noodles (Veg)',
    description: 'Classic wok-tossed noodles with colorful julienne vegetables, minced garlic, dry red chilies, and a dash of dark soy sauce.',
    price: 395,
    categoryId: 'cat-noodles',
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=600&auto=format&fit=crop',
    isVeg: true,
    isNonVeg: false,
    spiceLevel: 2,
    isDraft: false
  },
  // Rice
  {
    id: 'rice-1',
    name: 'Butterfly Pea Jasmine Rice',
    description: 'Premium Thai Jasmine rice naturally dyed with blue butterfly pea flowers, steamed with lemongrass and lime leaves.',
    price: 325,
    categoryId: 'cat-rice',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=600&auto=format&fit=crop',
    isVeg: true,
    isNonVeg: false,
    spiceLevel: 0,
    isDraft: false
  },
  {
    id: 'rice-2',
    name: 'Spicy Thai Basil Fried Rice (Chicken)',
    description: 'Fragrant jasmine rice wok-fried with minced chicken, fresh holy basil, bird\'s eye chilies, onions, garlic, and a sunny-side-up egg.',
    price: 445,
    categoryId: 'cat-rice',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=600&auto=format&fit=crop',
    isVeg: false,
    isNonVeg: true,
    spiceLevel: 3,
    isDraft: false
  },
  // Main Course
  {
    id: 'main-1',
    name: 'Royal Thai Green Curry (Veg)',
    description: 'An aromatic herb-rich curry of green chilies, lemongrass, and sweet basil cooked in rich coconut milk with exotic Asian vegetables.',
    price: 495,
    categoryId: 'cat-main-course',
    image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?q=80&w=600&auto=format&fit=crop',
    isVeg: true,
    isNonVeg: false,
    spiceLevel: 2,
    isDraft: false
  },
  {
    id: 'main-2',
    name: 'Kung Pao Chicken',
    description: 'Sautéed diced chicken breast with roasted cashew nuts, bell peppers, dried red chilies, and Sichuan peppercorns in a savory sweet-tangy glaze.',
    price: 545,
    categoryId: 'cat-main-course',
    image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?q=80&w=600&auto=format&fit=crop',
    isVeg: false,
    isNonVeg: true,
    spiceLevel: 2,
    isDraft: false
  },
  // Desserts
  {
    id: 'dessert-1',
    name: 'Mango Sticky Rice',
    description: 'Sweet Thai sticky rice cooked in coconut cream, served with slices of fresh sweet mango and sprinkled with toasted mung beans.',
    price: 345,
    categoryId: 'cat-desserts',
    image: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?q=80&w=600&auto=format&fit=crop',
    isVeg: true,
    isNonVeg: false,
    spiceLevel: 0,
    isDraft: false
  },
  {
    id: 'dessert-2',
    name: 'Matcha Chocolate Lava Cake',
    description: 'Warm molten dark chocolate cake with a premium Uji matcha white chocolate liquid core, served with a scoop of vanilla bean gelato.',
    price: 395,
    categoryId: 'cat-desserts',
    image: 'https://images.unsplash.com/photo-1541795795328-f073b763494e?q=80&w=600&auto=format&fit=crop',
    isVeg: true,
    isNonVeg: false,
    spiceLevel: 0,
    isDraft: false
  },
  // Beverages
  {
    id: 'bev-1',
    name: 'Hokai Lemongrass Ginger Cooler',
    description: 'Our signature mocktail. Cold-muddled lemongrass, fresh ginger root extract, kaffir lime syrup, club soda, and ice.',
    price: 245,
    categoryId: 'cat-beverages',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop',
    isVeg: true,
    isNonVeg: false,
    spiceLevel: 0,
    isDraft: false
  },
  {
    id: 'bev-2',
    name: 'Lychee Jasmine Iced Tea',
    description: 'Chilled artisanal loose-leaf jasmine green tea, sweetened with sweet lychee nectar and garnished with fresh mint sprigs.',
    price: 225,
    categoryId: 'cat-beverages',
    image: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?q=80&w=600&auto=format&fit=crop',
    isVeg: true,
    isNonVeg: false,
    spiceLevel: 0,
    isDraft: false
  }
];

const initialWebsiteContent: WebsiteContent = {
  heroBanner: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop',
  aboutSection: 'HOKAI Pan-Asian Kitchen brings you an exquisite selection of culinary wonders from the vibrant heart of Asia. Nestled in a premium, ultra-modern luxury environment, our chefs synthesize fresh, local premium ingredients with traditional culinary methods. From masterfully crafted sushi and delicate steamed momos to high-fired wok specialties and royal Thai curries, HOKAI invites you on an unforgettable journey of gastronomic luxury.',
  contactInfo: {
    phone: '+1 (555) 732-8888',
    whatsapp: '15557328888',
    email: 'info@hokai-kitchen.com',
    address: '888 Golden Dragon Blvd, Luxury Quarter, Suite 100',
    googleMaps: 'https://maps.google.com/?q=888+Golden+Dragon+Blvd,+Luxury+Quarter',
    facebook: 'https://facebook.com/hokai.kitchen',
    instagram: 'https://instagram.com/hokai.kitchen'
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

const initialDb: DatabaseSchema = {
  categories: initialCategories,
  menuItems: initialMenuItems,
  websiteContent: initialWebsiteContent,
  adminSettings: {
    adminId: 'Ak732888',
    passwordHash: 'Ak732888' // Storing plain text password as per explicit user admin setup
  }
};

export class DBManager {
  private static cachedData: DatabaseSchema | null = null;

  static load(): DatabaseSchema {
    if (this.cachedData) {
      return this.cachedData;
    }

    try {
      if (fs.existsSync(DB_PATH)) {
        const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
        const parsed = JSON.parse(fileContent);
        // Ensure standard properties are present
        if (parsed.categories && parsed.menuItems && parsed.websiteContent) {
          this.cachedData = parsed;
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading DB from file, recreating initial data:', e);
    }

    // Save initial data
    this.save(initialDb);
    this.cachedData = initialDb;
    return initialDb;
  }

  static save(data: DatabaseSchema): void {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
      this.cachedData = data;
    } catch (e) {
      console.error('Error saving DB to file:', e);
    }
  }

  static getCategories(): Category[] {
    return this.load().categories;
  }

  static getMenuItems(): MenuItem[] {
    return this.load().menuItems;
  }

  static getWebsiteContent(): WebsiteContent {
    return this.load().websiteContent;
  }

  static getAdminSettings() {
    return this.load().adminSettings;
  }

  static updateCategories(categories: Category[]): void {
    const db = this.load();
    db.categories = categories;
    this.save(db);
  }

  static updateMenuItems(menuItems: MenuItem[]): void {
    const db = this.load();
    db.menuItems = menuItems;
    this.save(db);
  }

  static updateWebsiteContent(content: Partial<WebsiteContent>): void {
    const db = this.load();
    db.websiteContent = {
      ...db.websiteContent,
      ...content,
      contactInfo: {
        ...db.websiteContent.contactInfo,
        ...(content.contactInfo || {})
      }
    };
    this.save(db);
  }

  static updateAdminSettings(adminId: string, passwordHash: string): void {
    const db = this.load();
    db.adminSettings = { adminId, passwordHash };
    this.save(db);
  }
}
