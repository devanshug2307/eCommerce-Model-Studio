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
    const { userId, pack } = req.body as CreateCheckoutBody;
    if (!userId || !pack) {
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
      return res.status(400).json({ error: 'Unsupported pack' });
    }

    // Call Dodo Payments Checkout Sessions (server-side, with your secret)
    // Support both DODO_PAYMENTS_API_KEY and DODOPAYMENTS_API_KEY naming conventions
    const apiKey = process.env.DODO_PAYMENTS_API_KEY || process.env.DODOPAYMENTS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Server not configured (DODO_PAYMENTS_API_KEY or DODOPAYMENTS_API_KEY missing).' });
    }

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
        return_url: `${process.env.APP_BASE_URL}/?status=success`,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(500).json({ error: 'Failed to create checkout session', detail: text });
    }

    const data = await response.json();
    return res.status(200).json({ url: data?.checkout_url });
  } catch (err: any) {
    return res.status(500).json({ error: 'Unexpected error', detail: err?.message });
  }
}
