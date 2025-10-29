// Vercel Serverless Function webhook handler for Dodo Payments events
// Stores credits in Supabase database

import type { VercelRequest, VercelResponse } from '@vercel/node';

type CreditPack = 100 | 200 | 300;

// Get Supabase credentials from environment
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://lkfdimrlbctlughzocis.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrZmRpbXJsYmN0bHVnaHpvY2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NDg1NjIsImV4cCI6MjA3NzMyNDU2Mn0.utPah48Z1sXzTEE_ngYe3RGOQvbCS84KxyjE75CtOKg';

// Add credits to user using Supabase database
async function addCreditsToUser(userId: string, credits: number): Promise<void> {
  try {
    // Call Supabase function to add credits
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/add_user_credits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        p_user_id: userId,
        p_credits: credits,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Supabase error: ${errorText}`);
    }

    const newBalance = await response.json();
    console.log(`Credited ${credits} credits to user ${userId}. New balance: ${newBalance}`);
  } catch (error: any) {
    console.error('Error adding credits to user:', error);
    throw error;
  }
}

// Deduct credits from user (for refunds)
async function deductCreditsFromUser(userId: string, credits: number): Promise<void> {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/deduct_user_credits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        p_user_id: userId,
        p_credits: credits,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Supabase error: ${errorText}`);
    }

    const newBalance = await response.json();
    console.log(`Deducted ${credits} credits from user ${userId}. New balance: ${newBalance}`);
  } catch (error: any) {
    console.error('Error deducting credits from user:', error);
    throw error;
  }
}

function packToCredits(pack: CreditPack): number {
  return pack;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers (webhooks may need CORS for debugging)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const event = req.body;
    const eventType = event?.type || event?.event_type;
    
    console.log('Received webhook event:', eventType);

    // Handle payment.succeeded - credit the user
    if (eventType === 'payment.succeeded') {
      const metadata = event?.data?.metadata || event?.metadata || {};
      const userId: string | undefined = metadata.user_id;
      const packRaw = Number(metadata.credit_pack);
      const pack = (packRaw === 100 || packRaw === 200 || packRaw === 300) ? (packRaw as CreditPack) : undefined;

      if (userId && pack) {
        await addCreditsToUser(userId, packToCredits(pack));
        console.log(`Successfully credited ${pack} credits to user ${userId}`);
        return res.status(200).json({ received: true, eventType, message: `Credited ${pack} credits to user ${userId}` });
      } else {
        console.warn('Missing userId or pack in metadata:', { userId, pack, metadata });
        return res.status(400).json({ error: 'Missing userId or pack in metadata' });
      }
    }

    // Handle refund.succeeded - deduct credits
    if (eventType === 'refund.succeeded') {
      const metadata = event?.data?.metadata || event?.metadata || {};
      const userId: string | undefined = metadata.user_id;
      const packRaw = Number(metadata.credit_pack);
      const pack = (packRaw === 100 || packRaw === 200 || packRaw === 300) ? (packRaw as CreditPack) : undefined;

      if (userId && pack) {
        await deductCreditsFromUser(userId, packToCredits(pack));
        console.log(`Successfully deducted ${pack} credits from user ${userId}`);
        return res.status(200).json({ received: true, eventType, message: `Deducted ${pack} credits from user ${userId}` });
      }
    }

    // Acknowledge other events
    console.log(`Acknowledged webhook event: ${eventType}`);
    return res.status(200).json({ received: true, eventType });
  } catch (e: any) {
    console.error('Webhook processing error:', {
      error: e,
      message: e?.message,
      stack: e?.stack,
    });
    return res.status(500).json({ 
      error: 'Webhook processing error', 
      detail: e?.message || 'Unknown error occurred',
      stack: process.env.NODE_ENV === 'development' ? e?.stack : undefined
    });
  }
}



