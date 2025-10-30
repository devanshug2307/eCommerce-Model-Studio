import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'ems_user_credits_v1';

export type CreditPack = 100 | 200 | 300;

// Get user ID from Supabase auth
export async function getUserId(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id ?? null;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
}

async function getAccessToken(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  } catch {
    return null;
  }
}

// Get credits from localStorage (cached)
export function getCredits(): number {
  const stored = localStorage.getItem(STORAGE_KEY);
  const value = stored ? Number(stored) : 0;
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

// Set credits in localStorage (cache)
export function setCredits(amount: number): void {
  const safe = Math.max(0, Math.floor(amount));
  localStorage.setItem(STORAGE_KEY, String(safe));
}

// Fetch credits from Supabase database
export async function fetchCreditsFromDatabase(): Promise<number> {
  const apiUrl = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_CHECKOUT_API_URL || (typeof window !== 'undefined' ? window.location.origin : '')) as string;
  
  if (!apiUrl) {
    console.warn('No API URL configured. Using cached credits.');
    return getCredits();
  }

  try {
    const token = await getAccessToken();
    if (!token) {
      console.warn('No access token. Using cached credits.');
      return getCredits();
    }
    
    const response = await fetch(`${apiUrl}/api/credits/get`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch credits');
    }

    const data = await response.json();
    const credits = data.credits || 0;
    
    // Update localStorage cache
    setCredits(credits);
    
    return credits;
  } catch (error) {
    console.error('Error fetching credits from database:', error);
    // Return cached value on error
    return getCredits();
  }
}

// Sync credits with database (call this after payment or periodically)
export async function syncCredits(): Promise<number> {
  return await fetchCreditsFromDatabase();
}

export function addCredits(amount: number): number {
  const current = getCredits();
  const next = current + Math.max(0, Math.floor(amount));
  setCredits(next);
  return next;
}

export async function consumeCredits(amount: number): Promise<{ ok: boolean; remaining: number; error?: string }>
{
  const apiUrl = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_CHECKOUT_API_URL || (typeof window !== 'undefined' ? window.location.origin : '')) as string;
  if (!apiUrl) {
    // Without backend, we cannot safely deduct from DB. Use cached and fail-safe.
    const current = getCredits();
    if (current < amount) return { ok: false, remaining: current };
    const next = current - amount;
    setCredits(next);
    return { ok: true, remaining: next };
  }

  try {
    const token = await getAccessToken();
    if (!token) {
      return { ok: false, remaining: getCredits() };
    }

    const response = await fetch(`${apiUrl}/api/credits/use`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ amount }),
    });

    if (!response.ok) {
      let errorMessage: string | undefined;
      try {
        const data = await response.json();
        errorMessage = data?.error;
      } catch {}
      // Refresh local cache from DB to correct stale UI when a deduct fails
      await syncCredits();
      return { ok: false, remaining: getCredits(), error: errorMessage };
    }

    const data = await response.json();
    const remaining = Number(data.remaining) || 0;
    setCredits(remaining);
    return { ok: true, remaining };
  } catch (e) {
    console.error('Error consuming credits:', e);
    return { ok: false, remaining: getCredits() };
  }
}

export function creditsNeededPerImage(): number {
  // 10 images per 100 credits => 10 credits per image
  return 10;
}

export function mapPackToCredits(pack: CreditPack): number {
  return pack; // packs are already expressed in credits
}

// Start a checkout session on your backend and return redirect URL
export async function startCheckout(pack: CreditPack): Promise<{ url: string }> {
  const apiUrl = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_CHECKOUT_API_URL || (typeof window !== 'undefined' ? window.location.origin : '')) as string;
  
  if (!apiUrl) {
    // Fallback: simulate immediate crediting for local development without backend
    console.warn('No API URL configured. Adding credits locally for development.');
    addCredits(mapPackToCredits(pack));
    return { url: '/' };
  }

  try {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('You must be signed in to purchase credits.');
    }

    const response = await fetch(`${apiUrl}/api/credits/createCheckoutSession`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        pack,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to create checkout session' }));
      throw new Error(error.error || error.message || 'Failed to create checkout session');
    }

    const data = await response.json();
    return { url: data.url };
  } catch (error: any) {
    console.error('Checkout error:', error);
    throw error;
  }
}


