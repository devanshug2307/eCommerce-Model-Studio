const STORAGE_KEY = 'ems_user_credits_v1';
const USER_ID_KEY = 'ems_user_id';

export type CreditPack = 100 | 200 | 300;

// Get user ID from localStorage or generate one
export function getUserId(): string {
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
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
  const apiUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_CHECKOUT_API_URL;
  
  if (!apiUrl) {
    console.warn('No API URL configured. Using cached credits.');
    return getCredits();
  }

  try {
    const userId = getUserId();
    const response = await fetch(`${apiUrl}/api/credits/get?userId=${encodeURIComponent(userId)}`);
    
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

export function consumeCredits(amount: number): { ok: boolean; remaining: number } {
  const current = getCredits();
  if (current < amount) {
    return { ok: false, remaining: current };
  }
  setCredits(current - amount);
  return { ok: true, remaining: current - amount };
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
  const apiUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_CHECKOUT_API_URL;
  
  if (!apiUrl) {
    // Fallback: simulate immediate crediting for local development without backend
    console.warn('No API URL configured. Adding credits locally for development.');
    addCredits(mapPackToCredits(pack));
    return { url: '/' };
  }

  try {
    const userId = getUserId();

    const response = await fetch(`${apiUrl}/api/credits/createCheckoutSession`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
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


