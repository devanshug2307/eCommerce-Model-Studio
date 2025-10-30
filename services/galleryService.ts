import { supabase } from '../lib/supabase';

async function getAccessToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

export type GalleryImage = {
  id: string;
  user_id: string;
  storage_path: string;
  public_url: string;
  width?: number;
  height?: number;
  created_at: string;
  gender?: string;
  age?: string;
  ethnicity?: string;
  background?: string;
  category?: string;
};

export async function uploadToGallery(dataUrl: string, meta?: { width?: number; height?: number; gender?: string; age?: string; ethnicity?: string; background?: string; category?: string }): Promise<GalleryImage | null> {
  const apiUrl = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_CHECKOUT_API_URL || (typeof window !== 'undefined' ? window.location.origin : '')) as string;
  const token = await getAccessToken();
  if (!apiUrl || !token) return null;

  const resp = await fetch(`${apiUrl}/api/gallery/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ dataUrl, ...(meta || {}) }),
  });
  if (!resp.ok) return null;
  const data = await resp.json();
  return data?.image ?? null;
}

export async function listGallery(): Promise<GalleryImage[]> {
  const apiUrl = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_CHECKOUT_API_URL || (typeof window !== 'undefined' ? window.location.origin : '')) as string;
  const token = await getAccessToken();
  if (!apiUrl || !token) return [];

  const resp = await fetch(`${apiUrl}/api/gallery/list`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!resp.ok) return [];
  const data = await resp.json();
  return (data?.images as GalleryImage[]) || [];
}


