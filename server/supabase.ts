import { createClient } from '@supabase/supabase-js';
import { Category, MenuItem, WebsiteContent } from './db.js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

let supabaseClient: any = null;
let envLogged = false;

export function getSupabaseClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    if (!envLogged) {
      console.log('[Database Connection]: Supabase credentials (SUPABASE_URL / SUPABASE_ANON_KEY) not provided. Defaulting to local persistent DBManager.');
      envLogged = true;
    }
    return null;
  }

  if (!supabaseClient) {
    try {
      console.log('[Database Connection]: Connecting to Supabase Cloud Database at:', url);
      supabaseClient = createClient(url, key, {
        auth: {
          persistSession: false
        }
      });
    } catch (error: any) {
      console.error('[Database Connection Error]: Failed to initialize Supabase client:', error.message || error);
      supabaseClient = null;
    }
  }
  return supabaseClient;
}

export async function getSupabaseCategories(): Promise<Category[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('categories')
      .select('*');

    if (error) {
      console.warn('[Supabase] Error fetching categories:', error.message);
      return null;
    }

    if (data) {
      return data.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug || cat.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
      }));
    }
    return [];
  } catch (err: any) {
    console.warn('[Supabase] Exception during categories fetch:', err.message || err);
    return null;
  }
}

export async function getSupabaseMenuItems(): Promise<MenuItem[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('menu_items')
      .select('*');

    if (error) {
      console.warn('[Supabase] Error fetching menu items:', error.message);
      return null;
    }

    if (data) {
      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: parseFloat(item.price) || 0,
        categoryId: item.categoryId || item.category_id || '',
        image: item.image || '',
        images: Array.isArray(item.images) ? item.images : (item.image ? [item.image] : []),
        isVeg: item.isVeg !== undefined ? !!item.isVeg : !!item.is_veg,
        isNonVeg: item.isNonVeg !== undefined ? !!item.isNonVeg : !!item.is_non_veg,
        spiceLevel: parseInt(item.spiceLevel !== undefined ? item.spiceLevel : item.spice_level) || 0,
        isDraft: item.isDraft !== undefined ? !!item.isDraft : !!item.is_draft
      }));
    }
    return [];
  } catch (err: any) {
    console.warn('[Supabase] Exception during menu items fetch:', err.message || err);
    return null;
  }
}

export async function getSupabaseWebsiteContent(): Promise<WebsiteContent | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('website_content')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn('[Supabase] Error fetching website content:', error.message);
      return null;
    }

    if (data) {
      const c = data.contact_info || data.contactInfo || {};
      return {
        restaurantName: data.restaurantName || data.restaurant_name || 'HOKAI',
        restaurantSubtitle: data.restaurantSubtitle || data.restaurant_subtitle || 'Pan-Asian Kitchen',
        heroBanner: data.heroBanner || data.hero_banner || '',
        aboutSection: data.aboutSection || data.about_section || '',
        contactInfo: {
          phone: data.phone || c.phone || '',
          whatsapp: data.whatsapp || c.whatsapp || '',
          email: data.email || c.email || '',
          website: data.website || c.website || '',
          address: data.address || c.address || '',
          googleMaps: data.googleMaps || data.google_maps || c.googleMaps || c.google_maps || '',
          openingTime: data.openingTime || data.opening_time || c.openingTime || c.opening_time || '',
          closingTime: data.closingTime || data.closing_time || c.closingTime || c.closing_time || '',
          weeklyHoliday: data.weeklyHoliday || data.weekly_holiday || c.weeklyHoliday || c.weekly_holiday || '',
          facebook: data.facebook || c.facebook || '',
          instagram: data.instagram || c.instagram || '',
          youtube: data.youtube || c.youtube || '',
          twitter: data.twitter || c.twitter || '',
          qrCodeImage: data.qrCodeImage || data.qr_code_image || c.qrCodeImage || c.qr_code_image || '',
          logo: data.logo || c.logo || '',
          contactBanner: data.contactBanner || data.contact_banner || c.contactBanner || c.contact_banner || ''
        },
        gallery: Array.isArray(data.gallery) ? data.gallery : []
      };
    }
    return null;
  } catch (err: any) {
    console.warn('[Supabase] Exception during website content fetch:', err.message || err);
    return null;
  }
}

export async function upsertSupabaseCategory(category: Category): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const payload = {
      id: category.id,
      name: category.name,
      slug: category.slug
    };
    const { error } = await client.from('categories').upsert(payload);
    if (error) {
      console.error('[Supabase] Error upserting category:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.error('[Supabase] Exception in upserting category:', err.message || err);
    return false;
  }
}

export async function deleteSupabaseCategory(id: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from('categories').delete().eq('id', id);
    if (error) {
      console.error('[Supabase] Error deleting category:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.error('[Supabase] Exception in deleting category:', err.message || err);
    return false;
  }
}

export async function deleteSupabaseCategories(ids: string[]): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from('categories').delete().in('id', ids);
    if (error) {
      console.error('[Supabase] Error deleting multiple categories:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.error('[Supabase] Exception in deleting multiple categories:', err.message || err);
    return false;
  }
}

export async function deleteAllSupabaseCategories(): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from('categories').delete().neq('id', 'this_should_never_match_hopefully');
    if (error) {
      console.error('[Supabase] Error deleting all categories:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.error('[Supabase] Exception in deleting all categories:', err.message || err);
    return false;
  }
}

export async function upsertSupabaseMenuItem(item: MenuItem): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const camelPayload = {
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      categoryId: item.categoryId,
      image: item.image,
      images: item.images || [item.image],
      isVeg: item.isVeg,
      isNonVeg: item.isNonVeg,
      spiceLevel: item.spiceLevel,
      isDraft: item.isDraft
    };

    const { error: camelErr } = await client.from('menu_items').upsert(camelPayload);
    if (!camelErr) return true;

    console.warn('[Supabase] camelCase upsert failed, trying snake_case fields:', camelErr.message);

    const snakePayload = {
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      category_id: item.categoryId,
      image: item.image,
      images: item.images || [item.image],
      is_veg: item.isVeg,
      is_non_veg: item.isNonVeg,
      spice_level: item.spiceLevel,
      is_draft: item.isDraft
    };

    const { error: snakeErr } = await client.from('menu_items').upsert(snakePayload);
    if (snakeErr) {
      console.error('[Supabase] snake_case upsert also failed:', snakeErr.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.error('[Supabase] Exception in upserting menu item:', err.message || err);
    return false;
  }
}

export async function deleteSupabaseMenuItem(id: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from('menu_items').delete().eq('id', id);
    if (error) {
      console.error('[Supabase] Error deleting menu item:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.error('[Supabase] Exception in deleting menu item:', err.message || err);
    return false;
  }
}

export async function deleteSupabaseMenuItems(ids: string[]): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from('menu_items').delete().in('id', ids);
    if (error) {
      console.error('[Supabase] Error deleting multiple menu items:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.error('[Supabase] Exception in deleting multiple menu items:', err.message || err);
    return false;
  }
}

export async function deleteAllSupabaseMenuItems(): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from('menu_items').delete().neq('id', 'this_should_never_match_hopefully');
    if (error) {
      console.error('[Supabase] Error deleting all menu items:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.error('[Supabase] Exception in deleting all menu items:', err.message || err);
    return false;
  }
}

export async function upsertSupabaseWebsiteContent(content: WebsiteContent): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { data: existing } = await client.from('website_content').select('id').limit(1).maybeSingle();
    const id = existing?.id || 1;

    const camelPayload = {
      id,
      restaurantName: content.restaurantName,
      restaurantSubtitle: content.restaurantSubtitle,
      heroBanner: content.heroBanner,
      aboutSection: content.aboutSection,
      phone: content.contactInfo?.phone,
      whatsapp: content.contactInfo?.whatsapp,
      email: content.contactInfo?.email,
      website: content.contactInfo?.website,
      address: content.contactInfo?.address,
      googleMaps: content.contactInfo?.googleMaps,
      openingTime: content.contactInfo?.openingTime,
      closingTime: content.contactInfo?.closingTime,
      weeklyHoliday: content.contactInfo?.weeklyHoliday,
      facebook: content.contactInfo?.facebook,
      instagram: content.contactInfo?.instagram,
      youtube: content.contactInfo?.youtube,
      twitter: content.contactInfo?.twitter,
      qrCodeImage: content.contactInfo?.qrCodeImage,
      logo: content.contactInfo?.logo,
      contactBanner: content.contactInfo?.contactBanner,
      gallery: content.gallery,
      contact_info: content.contactInfo
    };

    const { error: camelErr } = await client.from('website_content').upsert(camelPayload);
    if (!camelErr) return true;

    console.warn('[Supabase] camelCase website_content upsert failed, trying snake_case:', camelErr.message);

    const snakePayload = {
      id,
      restaurant_name: content.restaurantName,
      restaurant_subtitle: content.restaurantSubtitle,
      hero_banner: content.heroBanner,
      about_section: content.aboutSection,
      phone: content.contactInfo?.phone,
      whatsapp: content.contactInfo?.whatsapp,
      email: content.contactInfo?.email,
      website: content.contactInfo?.website,
      address: content.contactInfo?.address,
      google_maps: content.contactInfo?.googleMaps,
      opening_time: content.contactInfo?.openingTime,
      closing_time: content.contactInfo?.closingTime,
      weekly_holiday: content.contactInfo?.weeklyHoliday,
      facebook: content.contactInfo?.facebook,
      instagram: content.contactInfo?.instagram,
      youtube: content.contactInfo?.youtube,
      twitter: content.contactInfo?.twitter,
      qr_code_image: content.contactInfo?.qrCodeImage,
      logo: content.contactInfo?.logo,
      contact_banner: content.contactInfo?.contactBanner,
      gallery: content.gallery,
      contact_info: content.contactInfo
    };

    const { error: snakeErr } = await client.from('website_content').upsert(snakePayload);
    if (snakeErr) {
      console.error('[Supabase] snake_case website_content upsert also failed:', snakeErr.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.error('[Supabase] Exception in upserting website content:', err.message || err);
    return false;
  }
}
