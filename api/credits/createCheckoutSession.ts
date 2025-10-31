// Vercel Serverless Function to create a Dodo Payments Checkout Session
import type { VercelRequest, VercelResponse } from '@vercel/node';

type CreditPack = 100 | 200 | 300;

interface CreateCheckoutBody {
  pack: CreditPack;
  // Optional preference to hint which UPI flow to lead with on hosted checkout
  // 'upi_intent' => opens UPI apps (PhonePe/Paytm/GPay) on mobile
  // 'upi_collect' => shows QR and allows entering UPI ID (VPA)
  // 'card' => user intentionally prefers paying by card
  prefer?: 'upi_intent' | 'upi_collect' | 'card';
  // Optional buyer phone number; helps some providers show UPI QR reliably on desktop
  // Expected E.164, e.g. +9198XXXXXXXX; we'll normalize minimal Indian inputs server-side
  phone?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    console.log('Received checkout request:', { body: req.body, method: req.method });
    
    // Validate Supabase access token and derive userId
    const SUPABASE_URL = process.env.SUPABASE_URL || 'https://lkfdimrlbctlughzocis.supabase.co';
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: 'Missing Authorization header' });
    }
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
    const userEmail: string | undefined =
      userData?.email || userData?.user_metadata?.email || userData?.user?.email;
    if (!userId) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    const { pack, prefer, phone } = req.body as CreateCheckoutBody;
    if (!pack) {
      console.error('Missing required fields:', { pack });
      return res.status(400).json({ error: 'Missing pack' });
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
      prefer,
      hasPhone: !!phone,
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
    // References:
    // - https://docs.dodopayments.com/developer-resources/checkout-session
    // - Allowed methods incl. UPI: upi_collect, upi_intent + keep credit/debit as fallback
    // UX goal:
    //  - Card should appear last (fallback)
    //  - Avoid showing two UPI tiles ("UPI" and "UPI ID") when confusing; show a single UPI variant per device
    // Behavior:
    //  - Mobile: prefer 'upi_intent' (opens UPI apps like PhonePe/Paytm/GPay)
    //  - Desktop: prefer 'upi_collect' (QR + UPI ID/VPA entry)
    //  - If DODO_UPI_SINGLE=true (default), we only include the preferred UPI variant to prevent duplicate tiles
    //  - If DODO_UPI_ONLY=true, completely hide cards
    const baseUpi = ['upi_collect', 'upi_intent'] as const;
    let upiOrder: string[] = [...baseUpi];
    if (prefer === 'upi_intent') upiOrder = ['upi_intent', 'upi_collect'];
    if (prefer === 'upi_collect') upiOrder = ['upi_collect', 'upi_intent'];

    // env toggles
    const upiOnly = String(process.env.DODO_UPI_ONLY || '').toLowerCase() === 'true';
    const upiSingle = String(process.env.DODO_UPI_SINGLE || 'true').toLowerCase() === 'true';

    // When single-variant mode is on and a preference is supplied, send only that UPI method
    const upiList =
      upiSingle && (prefer === 'upi_intent' || prefer === 'upi_collect')
        ? [prefer]
        : [...upiOrder];

    // Keep cards as fallback unless explicitly disabled
    const allowedPaymentMethodTypes = upiOnly ? [...upiList] : [...upiList, 'credit', 'debit'];

    // Normalize Indian phone input (allow "98xxxxxxxx" -> "+9198xxxxxxxx")
    const normalizedPhone = (() => {
      if (!phone) return undefined;
      let p = String(phone).trim();
      // Remove spaces/hyphens
      p = p.replace(/[\s-]/g, '');
      // Add +91 if looks like 10-digit Indian mobile
      if (/^[6-9]\d{9}$/.test(p)) return `+91${p}`;
      if (/^\+?91[6-9]\d{9}$/.test(p)) return p.startsWith('+') ? p : `+${p}`;
      // Fallback: if already in E.164, pass through; else ignore to avoid API issues
      if (/^\+\d{10,15}$/.test(p)) return p;
      return undefined;
    })();

    const customerBlock =
      userEmail || normalizedPhone
        ? {
            customer: {
              ...(userEmail ? { email: userEmail } : {}),
              ...(normalizedPhone ? { phone_number: normalizedPhone } : {}),
            },
          }
        : {};

    const requestBody = {
      product_cart: [
        { product_id: productId, quantity: 1 },
      ],
      // Prefer UPI; optionally hide cards when DODO_UPI_ONLY=true
      // Also optionally send a single UPI variant (DODO_UPI_SINGLE=true) to avoid two UPI tiles
      allowed_payment_method_types: allowedPaymentMethodTypes,
      // UPI typically settles in INR
      billing_currency: 'INR',
      // Provide minimal customer context (email/phone) to help UPI Collect show QR
      ...customerBlock,
      feature_flags: {
        // Helps hosted checkout prompt for phone when required by UPI providers.
        allow_phone_number_collection: true,
      },
      // Keep checkout minimal for digital goods by omitting full address objects
      metadata: {
        user_id: userId,
        credit_pack: String(pack),
        preferred_method: prefer || 'upi',
        // Hint for analytics/UX; safe no-op for API if unrecognized.
        upi_collect_hint: 'qr',
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
