// Vercel Serverless Function to get user credits from Supabase
// GET /api/credits/get?userId=xxx

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Get Supabase credentials from environment
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://lkfdimrlbctlughzocis.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrZmRpbXJsYmN0bHVnaHpvY2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NDg1NjIsImV4cCI6MjA3NzMyNDU2Mn0.utPah48Z1sXzTEE_ngYe3RGOQvbCS84KxyjE75CtOKg';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { userId } = req.query || {};
    
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId query parameter' });
    }

    // Fetch user credits from Supabase
    const response = await fetch(`${SUPABASE_URL}/rest/v1/user_credits?user_id=eq.${userId}&select=credits`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Supabase error: ${errorText}`);
    }

    const data = await response.json();
    
    // If user doesn't exist in database, return 0 credits
    const credits = data.length > 0 ? data[0].credits : 0;

    return res.status(200).json({ credits, userId });
  } catch (e: any) {
    console.error('Error fetching credits:', e);
    return res.status(500).json({ error: 'Error fetching credits', detail: e?.message });
  }
}
