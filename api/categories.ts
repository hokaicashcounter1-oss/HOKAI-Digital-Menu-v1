import { DBManager } from '../server/db.js';
import { getSupabaseCategories } from '../server/supabase.js';

export default async function handler(req: any, res: any) {
  // Setup CORS Headers for cross-origin ease
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 1. Try Supabase first if available
    const supabaseCategories = await getSupabaseCategories();
    if (supabaseCategories) {
      return res.status(200).json(supabaseCategories);
    }

    // 2. Fallback to local DBManager
    const categories = DBManager.getCategories();
    return res.status(200).json(categories);
  } catch (error: any) {
    console.warn('[Vercel API categories] Falling back to default mock data due to:', error.message || error);
    try {
      const categories = DBManager.getCategories();
      return res.status(200).json(categories);
    } catch (innerErr: any) {
      return res.status(500).json({ error: error.message || 'Failed to retrieve categories' });
    }
  }
}
