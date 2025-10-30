// Vercel Serverless Function to get user credits from Supabase
// GET /api/credits/get
// Requires Authorization: Bearer <supabase access_token>

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Get Supabase credentials from environment
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://lkfdimrlbctlughzocis.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrZmRpbXJsYmN0bHVnaHpvY2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NDg1NjIsImV4cCI6MjA3NzMyNDU2Mn0.utPah48Z1sXzTEE_ngYe3RGOQvbCS84KxyjE75CtOKg';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Validate Supabase access token
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: 'Missing Authorization header' });
    }

    // Derive user from token via Supabase Auth API
    const userResp = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!userResp.ok) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    const userData = await userResp.json();
    const userId: string | undefined = userData?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    // Fetch user credits from Supabase as the user (RLS needs the user token)
    const response = await fetch(`${SUPABASE_URL}/rest/v1/user_credits?user_id=eq.${userId}&select=credits`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Supabase error: ${errorText}`);
    }

    const data = await response.json();

    // If user doesn't exist in database, create a row with 0 credits so they appear immediately
    if (!Array.isArray(data) || data.length === 0) {
      try {
        const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
        if (SERVICE_ROLE_KEY) {
          const upsertResp = await fetch(`${SUPABASE_URL}/rest/v1/user_credits`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Prefer': 'resolution=merge-duplicates',
              'apikey': SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify({ user_id: userId, credits: 0 }),
          });
          // Non-fatal if this fails; we still return 0
          if (!upsertResp.ok) {
            const t = await upsertResp.text();
            console.warn('Failed to upsert user_credits row:', t);
          }
        } else {
          console.warn('No service role key set. Skipping creation of user_credits row.');
        }
      } catch (e) {
        console.warn('Error creating user_credits row:', e);
      }

      return res.status(200).json({ credits: 0, userId });
    }

    // Existing user row
    const credits = data[0].credits || 0;
    return res.status(200).json({ credits, userId });
  } catch (e: any) {
    console.error('Error fetching credits:', e);
    return res.status(500).json({ error: 'Error fetching credits', detail: e?.message });
  }
}
