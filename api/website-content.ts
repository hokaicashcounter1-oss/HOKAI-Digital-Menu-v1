import { DBManager } from '../server/db.js';
import { getSupabaseWebsiteContent } from '../server/supabase.js';

export default async function handler(req: any, res: any) {
  // Setup CORS Headers
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
    const supabaseContent = await getSupabaseWebsiteContent();
    if (supabaseContent) {
      return res.status(200).json(supabaseContent);
    }

    // 2. Fallback to local DBManager
    const content = DBManager.getWebsiteContent();
    return res.status(200).json(content);
  } catch (error: any) {
    console.warn('[Vercel API website-content] Falling back to default mock data due to:', error.message || error);
    try {
      const content = DBManager.getWebsiteContent();
      return res.status(200).json(content);
    } catch (innerErr: any) {
      return res.status(500).json({ error: error.message || 'Failed to retrieve website content' });
    }
  }
}
