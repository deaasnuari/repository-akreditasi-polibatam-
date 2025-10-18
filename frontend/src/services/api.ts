// src/services/api.ts
export const API_URL = "http://localhost:5000/api"; // backend  port 5000

export async function fetchData(endpoint: string, options: RequestInit = {}) {
  try {
    const res = await fetch(`${API_URL}/${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
      },
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
