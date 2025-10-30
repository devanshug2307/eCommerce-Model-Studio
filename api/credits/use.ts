// Vercel Serverless Function to deduct user credits in Supabase
// POST /api/credits/use
// body: { amount: number }

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Get Supabase credentials from environment
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://lkfdimrlbctlughzocis.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrZmRpbXJsYmN0bHVnaHpvY2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NDg1NjIsImV4cCI6MjA3NzMyNDU2Mn0.utPah48Z1sXzTEE_ngYe3RGOQvbCS84KxyjE75CtOKg';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

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

    const { amount } = (req.body || {}) as { amount?: number };
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Missing or invalid amount' });
    }

    // Call Supabase RPC to deduct credits atomically
    // Use service role key for server-side mutation
    const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/deduct_user_credits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY || SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY || SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ p_user_id: userId, p_credits: amount }),
    });

    const text = await response.text();
    if (!response.ok) {
      let detail: any = text;
      try { detail = JSON.parse(text); } catch {}
      const insufficient = typeof detail === 'string' && detail.includes('INSUFFICIENT_CREDITS');
      return res.status(insufficient ? 402 : 400).json({ error: insufficient ? 'Insufficient credits' : 'Failed to deduct credits', detail });
    }

    // The RPC should return the new balance
    let newBalance: number = 0;
    try { newBalance = JSON.parse(text); } catch { newBalance = Number(text) || 0; }

    return res.status(200).json({ remaining: newBalance });
  } catch (e: any) {
    console.error('Error deducting credits:', e);
    return res.status(500).json({ error: 'Server error', detail: e?.message });
  }
}


