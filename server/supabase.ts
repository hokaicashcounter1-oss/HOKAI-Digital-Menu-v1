import { createClient } from '@supabase/supabase-js';
import { Category, MenuItem, WebsiteContent } from './db.js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

let supabaseClient: any = null;

export function getSupabaseClient() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return null;
  }
  if (!supabaseClient) {
    try {
      supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: {
          persistSession: false
        }
      });
    } catch (error) {
      console.error('[Supabase] Failed to initialize Supabase client:', error);
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

    if (data && data.length > 0) {
      return data.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug || cat.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
      }));
    }
    return null;
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

    if (data && data.length > 0) {
      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: parseFloat(item.price) || 0,
        categoryId: item.categoryId || item.category_id || '',
        image: item.image || '',
        isVeg: item.isVeg !== undefined ? !!item.isVeg : !!item.is_veg,
        isNonVeg: item.isNonVeg !== undefined ? !!item.isNonVeg : !!item.is_non_veg,
        spiceLevel: parseInt(item.spiceLevel !== undefined ? item.spiceLevel : item.spice_level) || 0,
        isDraft: item.isDraft !== undefined ? !!item.isDraft : !!item.is_draft
      }));
    }
    return null;
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
      return {
        heroBanner: data.heroBanner || data.hero_banner || '',
        aboutSection: data.aboutSection || data.about_section || '',
        contactInfo: {
          phone: data.phone || (data.contact_info?.phone) || '',
          whatsapp: data.whatsapp || (data.contact_info?.whatsapp) || '',
          email: data.email || (data.contact_info?.email) || '',
          address: data.address || (data.contact_info?.address) || '',
          googleMaps: data.googleMaps || data.google_maps || (data.contact_info?.googleMaps || data.contact_info?.google_maps) || '',
          facebook: data.facebook || (data.contact_info?.facebook) || '',
          instagram: data.instagram || (data.contact_info?.instagram) || ''
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
      heroBanner: content.heroBanner,
      aboutSection: content.aboutSection,
      phone: content.contactInfo.phone,
      whatsapp: content.contactInfo.whatsapp,
      email: content.contactInfo.email,
      address: content.contactInfo.address,
      googleMaps: content.contactInfo.googleMaps,
      facebook: content.contactInfo.facebook,
      instagram: content.contactInfo.instagram,
      gallery: content.gallery
    };

    const { error: camelErr } = await client.from('website_content').upsert(camelPayload);
    if (!camelErr) return true;

    console.warn('[Supabase] camelCase website_content upsert failed, trying snake_case:', camelErr.message);

    const snakePayload = {
      id,
      hero_banner: content.heroBanner,
      about_section: content.aboutSection,
      phone: content.contactInfo.phone,
      whatsapp: content.contactInfo.whatsapp,
      email: content.contactInfo.email,
      address: content.contactInfo.address,
      google_maps: content.contactInfo.googleMaps,
      facebook: content.contactInfo.facebook,
      instagram: content.contactInfo.instagram,
      gallery: content.gallery
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
