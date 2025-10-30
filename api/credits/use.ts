// Vercel Serverless Function to deduct user credits in Supabase
// POST /api/credits/use
// body: { userId: string, amount: number }

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Get Supabase credentials from environment
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://lkfdimrlbctlughzocis.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrZmRpbXJsYmN0bHVnaHpvY2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NDg1NjIsImV4cCI6MjA3NzMyNDU2Mn0.utPah48Z1sXzTEE_ngYe3RGOQvbCS84KxyjE75CtOKg';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { userId, amount } = (req.body || {}) as { userId?: string; amount?: number };
    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Missing or invalid userId/amount' });
    }

    // Call Supabase RPC to deduct credits atomically
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/deduct_user_credits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ p_user_id: userId, p_credits: amount }),
    });

    const text = await response.text();
    if (!response.ok) {
      let detail: any = text;
      try { detail = JSON.parse(text); } catch {}
      return res.status(400).json({ error: 'Failed to deduct credits', detail });
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


