// src/services/api.ts
export const API_URL = "http://localhost:5000/api"; // backend  port 5000

export async function fetchData(endpoint: string, options: RequestInit = {}) {
  try {
    // Get token from cookies
    const token = getCookie('token');

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}/${endpoint}`, {
      headers,
      credentials: 'include', // Include cookies
      ...options,
    });

    // Kalau status bukan , lempar error
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `Error ${res.status}`);
    }

    // Kembalikan hasil JSON
    return res.json();
  } catch (error: any) {
    throw new Error(error.message || "Failed to connect to backend");
  }
}

function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
}
