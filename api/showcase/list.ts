import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://lkfdimrlbctlughzocis.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const q = req.query || {};
    const limit = Math.min(Number(q.limit) || 24, 100);
    const offset = Math.max(Number(q.offset) || 0, 0);
    const sort = String(q.sort || 'new') as 'new' | 'old';
    const order = sort === 'old' ? 'asc' : 'desc';

    // Build filters
    const params: string[] = ['select=*', `order=created_at.${order}`];
    if (q.gender) params.push(`gender=eq.${encodeURIComponent(String(q.gender))}`);
    if (q.age) params.push(`age=eq.${encodeURIComponent(String(q.age))}`);
    if (q.ethnicity) params.push(`ethnicity=eq.${encodeURIComponent(String(q.ethnicity))}`);
    if (q.background) params.push(`background=eq.${encodeURIComponent(String(q.background))}`);
    if (q.pose) params.push(`pose=eq.${encodeURIComponent(String(q.pose))}`);
    if (q.category) params.push(`category=eq.${encodeURIComponent(String(q.category))}`);
    if (q.input_storage_path) params.push(`input_storage_path=eq.${encodeURIComponent(String(q.input_storage_path))}`);
    if (q.created_by) params.push(`created_by=eq.${encodeURIComponent(String(q.created_by))}`);

    // Basic text search
    const text = (q.q ? String(q.q).trim() : '') as string;
    if (text) {
      const ilike = `ilike.*${encodeURIComponent(text)}*`;
      params.push(
        `or=(title.${ilike},category.${ilike},ethnicity.${ilike},background.${ilike},pose.${ilike})`
      );
    }

    const queryUrl = `${SUPABASE_URL}/rest/v1/public_showcase?${params.join('&')}&limit=${limit}&offset=${offset}`;
    const resp = await fetch(queryUrl, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    if (!resp.ok) {
      const t = await resp.text();
      return res.status(400).json({ error: 'Failed to fetch showcase', detail: t });
    }
    const items = await resp.json();
    return res.status(200).json({ items, limit, offset });
  } catch (e: any) {
    console.error('Showcase list error:', e);
    return res.status(500).json({ error: 'Server error', detail: e?.message });
  }
}


