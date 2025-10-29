// Vercel Serverless Function to create a Dodo Payments Checkout Session
// Works with Vite apps deployed on Vercel

type CreditPack = 100 | 200 | 300;

interface CreateCheckoutBody {
  userId: string; // your app user id
  pack: CreditPack;
}

export default async function handler(req: { method?: string; body?: any }, res: { status: (code: number) => { json: (data: any) => void }; json: (data: any) => void }) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const { userId, pack } = req.body as CreateCheckoutBody;
    if (!userId || !pack) {
      res.status(400).json({ error: 'Missing userId or pack' });
      return;
    }

    // Map credit pack to product IDs created in Dodo Payments
    const PACK_TO_PRODUCT: Record<CreditPack, string> = {
      100: 'pdt_PoJrpMJOBJnfMjyWESkOv', // 100 Credits Pack - $9.99
      200: 'pdt_VXiRA2vtwSPmayEhXgj1h', // 200 Credits Pack - $17.99
      300: 'pdt_GWA1vy1w6qNyz7zG5oIjg', // 300 Credits Pack - $24.99
    };

    const productId = PACK_TO_PRODUCT[pack as CreditPack];
    if (!productId) {
      res.status(400).json({ error: 'Unsupported pack' });
      return;
    }

    // Call Dodo Payments Checkout Sessions (server-side, with your secret)
    // Support both DODO_PAYMENTS_API_KEY and DODOPAYMENTS_API_KEY naming conventions
    const apiKey = process.env.DODO_PAYMENTS_API_KEY || process.env.DODOPAYMENTS_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'Server not configured (DODO_PAYMENTS_API_KEY or DODOPAYMENTS_API_KEY missing).' });
      return;
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
      res.status(500).json({ error: 'Failed to create checkout session', detail: text });
      return;
    }

    const data = await response.json();
    res.status(200).json({ url: data?.checkout_url });
  } catch (err: any) {
    res.status(500).json({ error: 'Unexpected error', detail: err?.message });
  }
}


