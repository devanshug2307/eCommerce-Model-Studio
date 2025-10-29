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

    // Determine API base URL based on environment (test or live)
    // Test Mode: https://test.dodopayments.com
    // Live Mode: https://live.dodopayments.com
    // Endpoint: POST /checkouts (not /checkout_sessions)
    const environment = process.env.DODO_PAYMENTS_ENV || 'test';
    const apiBaseUrl = environment === 'live' 
      ? 'https://live.dodopayments.com'
      : 'https://test.dodopayments.com';
    const apiUrl = `${apiBaseUrl}/checkouts`;
    
    console.log('Calling Dodo Payments API:', { apiUrl, apiBaseUrl, environment });
    
    // Build request body according to Dodo Payments API documentation
    // Reference: https://docs.dodopayments.com/api-reference/introduction
    const requestBody = {
      product_cart: [
        { product_id: productId, quantity: 1 },
      ],
      // Always provide 'credit' and 'debit' as fallback (required by API)
      allowed_payment_method_types: ['credit', 'debit'],
      metadata: {
        user_id: userId,
        credit_pack: String(pack),
      },
      // return_url is used for redirect after payment completion
      return_url: `${appBaseUrl}/?status=success`,
    };

    console.log('Request body being sent to Dodo Payments:', {
      ...requestBody,
      metadata: requestBody.metadata, // Keep metadata visible for debugging
    });

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Dodo Payments API response status:', response.status);

    // Get response text for error handling
    const responseText = await response.text();
    
    if (!response.ok) {
      console.error('Dodo Payments API error:', { 
        status: response.status,
        statusText: response.statusText,
        url: apiUrl,
        responseText 
      });
      
      // Try to parse error response if it's JSON
      let errorDetail;
      try {
        errorDetail = JSON.parse(responseText);
      } catch {
        errorDetail = responseText;
      }
      
      return res.status(500).json({ 
        error: 'Failed to create checkout session', 
        detail: errorDetail,
        status: response.status,
        statusText: response.statusText
      });
    }

    // Parse successful response
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse response JSON:', { responseText, parseError });
      return res.status(500).json({ 
        error: 'Failed to parse API response',
        detail: 'Invalid JSON response from Dodo Payments API'
      });
    }

    // Check for checkout_url in response
    if (!data?.checkout_url) {
      console.error('Missing checkout_url in API response:', data);
      return res.status(500).json({ 
        error: 'Invalid API response', 
        detail: 'Missing checkout_url in response',
        response: data
      });
    }

    console.log('Checkout session created successfully:', { 
      checkoutUrl: data.checkout_url,
      sessionId: data.session_id 
    });
    
    return res.status(200).json({ url: data.checkout_url });
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
