import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://lkfdimrlbctlughzocis.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    // Validate user token
    const authHeader = req.headers.authorization || '';
    const userToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!userToken) return res.status(401).json({ error: 'Missing Authorization header' });

    if (!SERVICE_ROLE_KEY) return res.status(500).json({ error: 'Missing service role key' });

    const userResp = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: 'GET',
      headers: { 'apikey': SERVICE_ROLE_KEY, 'Authorization': `Bearer ${userToken}` },
    });
    if (!userResp.ok) return res.status(401).json({ error: 'Invalid or expired token' });
    const user = await userResp.json();
    const userId: string | undefined = user?.id;
    const email: string = (user?.email || '').toLowerCase();
    if (!userId) return res.status(401).json({ error: 'Invalid session' });
    if (ADMIN_EMAILS.length > 0 && !ADMIN_EMAILS.includes(email)) {
      return res.status(403).json({ error: 'Forbidden (not an admin)' });
    }

    const { dataUrl, inputDataUrl, input_public_url: inputPublicUrlBody, input_storage_path: inputStoragePathBody, gender, age, ethnicity, background, pose, category, title, tags } = (req.body || {}) as any;
    if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
      return res.status(400).json({ error: 'Missing or invalid dataUrl' });
    }

    const mimeMatch = dataUrl.match(/^data:(.*?);base64,/);
    const mimeType = mimeMatch?.[1] || 'image/png';
    const base64 = dataUrl.split(',')[1];
    const buffer = Buffer.from(base64, 'base64');

    // Ensure bucket exists (idempotent)
    await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ name: 'showcase', public: true }),
    });

    const ext = mimeType.split('/')[1] || 'png';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const storagePath = `${userId}/${filename}`;

    // Upload object
    const uploadResp = await fetch(`${SUPABASE_URL}/storage/v1/object/showcase/${encodeURIComponent(storagePath)}`, {
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

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/showcase/${encodeURIComponent(storagePath)}`;

    // Optionally upload input image
    let inputPublicUrl: string | null = null;
    let inputStoragePath: string | null = null;
    if (inputPublicUrlBody && typeof inputPublicUrlBody === 'string') {
      inputPublicUrl = inputPublicUrlBody;
      inputStoragePath = inputStoragePathBody || null;
    } else if (inputDataUrl && typeof inputDataUrl === 'string' && inputDataUrl.startsWith('data:')) {
      const iMimeMatch = inputDataUrl.match(/^data:(.*?);base64,/);
      const iMimeType = iMimeMatch?.[1] || 'image/png';
      const iBase64 = inputDataUrl.split(',')[1];
      const iBuffer = Buffer.from(iBase64, 'base64');
      const iExt = iMimeType.split('/')[1] || 'png';
      const iFilename = `input-${Date.now()}-${Math.random().toString(36).slice(2)}.${iExt}`;
      const iPath = `${userId}/${iFilename}`;
      const iUpload = await fetch(`${SUPABASE_URL}/storage/v1/object/showcase/${encodeURIComponent(iPath)}`, {
        method: 'POST',
        headers: {
          'Content-Type': iMimeType,
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'x-upsert': 'true',
        },
        body: iBuffer,
      });
      if (!iUpload.ok) {
        const t = await iUpload.text();
        return res.status(400).json({ error: 'Input upload failed', detail: t });
      }
      inputPublicUrl = `${SUPABASE_URL}/storage/v1/object/public/showcase/${encodeURIComponent(iPath)}`;
      inputStoragePath = iPath;
    }

    // Record in public_showcase (service role bypasses RLS)
    const insertResp = await fetch(`${SUPABASE_URL}/rest/v1/public_showcase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({ 
        title: title || null,
        public_url: publicUrl,
        storage_path: storagePath,
        gender, age, ethnicity, background, pose, category: category || null,
        tags: Array.isArray(tags) ? tags : null,
        created_by: userId,
        input_public_url: inputPublicUrl,
        input_storage_path: inputStoragePath,
      }),
    });
    if (!insertResp.ok) {
      const t = await insertResp.text();
      return res.status(400).json({ error: 'Failed to record showcase metadata', detail: t });
    }
    const record = await insertResp.json();

    return res.status(200).json({ ok: true, item: record?.[0] ?? null });
  } catch (e: any) {
    console.error('Showcase upload error:', e);
    return res.status(500).json({ error: 'Server error', detail: e?.message });
  }
}


