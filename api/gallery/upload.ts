import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://lkfdimrlbctlughzocis.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    // Validate user token to get user_id
    const authHeader = req.headers.authorization || '';
    const userToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!userToken) return res.status(401).json({ error: 'Missing Authorization header' });

    const userResp = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: 'GET',
      headers: { 'apikey': SERVICE_ROLE_KEY, 'Authorization': `Bearer ${userToken}` },
    });
    if (!userResp.ok) return res.status(401).json({ error: 'Invalid or expired token' });
    const user = await userResp.json();
    const userId: string | undefined = user?.id;
    if (!userId) return res.status(401).json({ error: 'Invalid session' });

    const { dataUrl, width, height, gender, age, ethnicity, background, category } = (req.body || {}) as { dataUrl?: string; width?: number; height?: number; gender?: string; age?: string; ethnicity?: string; background?: string; category?: string };
    if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
      return res.status(400).json({ error: 'Missing or invalid dataUrl' });
    }

    const mimeMatch = dataUrl.match(/^data:(.*?);base64,/);
    const mimeType = mimeMatch?.[1] || 'image/png';
    const base64 = dataUrl.split(',')[1];
    const buffer = Buffer.from(base64, 'base64');

    // Ensure bucket exists (idempotent)
    if (!SERVICE_ROLE_KEY) return res.status(500).json({ error: 'Missing service role key' });
    await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ name: 'gallery', public: true }),
    });

    const ext = mimeType.split('/')[1] || 'png';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const storagePath = `${userId}/${filename}`;

    // Upload object
    const uploadResp = await fetch(`${SUPABASE_URL}/storage/v1/object/gallery/${encodeURIComponent(storagePath)}`, {
      method: 'POST',
      headers: {
        'Content-Type': mimeType,
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'x-upsert': 'true',
      },
      body: buffer,
    });
    if (!uploadResp.ok) {
      const t = await uploadResp.text();
      return res.status(400).json({ error: 'Upload failed', detail: t });
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/gallery/${encodeURIComponent(storagePath)}`;

    // Record in user_images (service role bypasses RLS)
    const insertResp = await fetch(`${SUPABASE_URL}/rest/v1/user_images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({ 
        user_id: userId, 
        storage_path: storagePath, 
        public_url: publicUrl, 
        width, 
        height,
        gender,
        age,
        ethnicity,
        background,
        category
      }),
    });
    if (!insertResp.ok) {
      const t = await insertResp.text();
      return res.status(400).json({ error: 'Failed to record image metadata', detail: t });
    }
    const record = await insertResp.json();

    return res.status(200).json({ ok: true, image: record?.[0] ?? null });
  } catch (e: any) {
    console.error('Gallery upload error:', e);
    return res.status(500).json({ error: 'Server error', detail: e?.message });
  }
}


