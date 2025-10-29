// Vercel Serverless Function to create a Dodo Payments Checkout Session
import type { VercelRequest, VercelResponse } from '@vercel/node';

type CreditPack = 100 | 200 | 300;

interface CreateCheckoutBody {
  userId: string; // your app user id
  pack: CreditPack;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
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
    console.log('Received checkout request:', { body: req.body, method: req.method });
    
    const { userId, pack } = req.body as CreateCheckoutBody;
    if (!userId || !pack) {
      console.error('Missing required fields:', { userId, pack });
      return res.status(400).json({ error: 'Missing userId or pack' });
    }

    // Map credit pack to product IDs created in Dodo Payments
    const PACK_TO_PRODUCT: Record<CreditPack, string> = {
      100: 'pdt_PoJrpMJOBJnfMjyWESkOv', // 100 Credits Pack - $9.99
      200: 'pdt_VXiRA2vtwSPmayEhXgj1h', // 200 Credits Pack - $17.99
      300: 'pdt_GWA1vy1w6qNyz7zG5oIjg', // 300 Credits Pack - $24.99
    };

    const productId = PACK_TO_PRODUCT[pack as CreditPack];
    if (!productId) {
      console.error('Unsupported pack:', pack);
      return res.status(400).json({ error: 'Unsupported pack' });
    }

    // Call Dodo Payments Checkout Sessions (server-side, with your secret)
    // Support both DODO_PAYMENTS_API_KEY and DODOPAYMENTS_API_KEY naming conventions
    const apiKey = process.env.DODO_PAYMENTS_API_KEY || process.env.DODOPAYMENTS_API_KEY;
    
    // Log which env var was found (for debugging)
    const hasDodoPaymentsKey = !!process.env.DODO_PAYMENTS_API_KEY;
    const hasDodopaymentsKey = !!process.env.DODOPAYMENTS_API_KEY;
    console.log('Environment variable check:', { 
      hasDodoPaymentsKey, 
      hasDodopaymentsKey, 
      hasApiKey: !!apiKey,
      appBaseUrl: process.env.APP_BASE_URL 
    });
    
    if (!apiKey) {
      console.error('Missing API key in environment variables');
      return res.status(500).json({ 
        error: 'Server not configured', 
        detail: 'DODO_PAYMENTS_API_KEY or DODOPAYMENTS_API_KEY missing from environment variables. Check Vercel dashboard settings.' 
      });
    }

    // Ensure APP_BASE_URL is set
    const appBaseUrl = process.env.APP_BASE_URL || 'https://e-commerce-model-studio.vercel.app';
    console.log('Creating checkout session with:', { 
      productId, 
      userId, 
      pack, 
      appBaseUrl,
      apiKeyPrefix: apiKey.substring(0, 10) + '...' // Log only first 10 chars for security
    });

    // The exact endpoint/shape may differ; consult Dodo Payments API docs.
    // Include metadata so webhook can credit the correct user.
    const response = await fetch('https://api.dodopayments.com/v1/checkout_sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        product_cart: [
          { product_id: productId, quantity: 1 },
        ],
        metadata: {
          user_id: userId,
          credit_pack: String(pack),
        },
        // return_url is used for redirect after payment completion
        return_url: `${appBaseUrl}/?status=success`,
      }),
    });

    console.log('Dodo Payments API response status:', response.status);

    if (!response.ok) {
      const text = await response.text();
      console.error('Dodo Payments API error:', { status: response.status, text });
      return res.status(500).json({ 
        error: 'Failed to create checkout session', 
        detail: text,
        status: response.status 
      });
    }

    const data = await response.json();
    console.log('Checkout session created successfully:', { checkoutUrl: data?.checkout_url });
    return res.status(200).json({ url: data?.checkout_url });
  } catch (err: any) {
    console.error('Unexpected error in createCheckoutSession:', {
      error: err,
      message: err?.message,
      stack: err?.stack,
    });
    return res.status(500).json({ 
      error: 'Unexpected error', 
      detail: err?.message || 'Unknown error occurred',
      stack: process.env.NODE_ENV === 'development' ? err?.stack : undefined
    });
  }
}
