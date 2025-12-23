const API_BASE = 'http://localhost:5000/api/reviews';

export async function getReviews(moduleName: string, itemId?: number) {
  const params = new URLSearchParams();
  params.append('module', moduleName);
  if (itemId !== undefined) params.append('itemId', String(itemId));

  try {
    const res = await fetch(`${API_BASE}?${params.toString()}`, { credentials: 'include' });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${res.status}`);
    }
    const json = await res.json();
    return json.data || [];
  } catch (err: any) {
    console.error('🔴 getReviews error:', err);
    throw err;
  }
}

export async function createReview(moduleName: string, itemId: number, note: string, status?: string) {
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ module: moduleName, itemId, note, status }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`);
    return json.data;
  } catch (err: any) {
    console.error('🔴 createReview error:', err);
    throw err;
  }
}

export async function deleteReview(reviewId: number) {
  try {
    const res = await fetch(`${API_BASE}/${reviewId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`);
    return json;
  } catch (err: any) {
    console.error('🔴 deleteReview error:', err);
    throw err;
  }
}
