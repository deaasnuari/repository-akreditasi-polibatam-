import { getCurrentUser } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const API_BASE_LED = `${API_URL}/api/led`;

/* ==================== TYPE DEFINITIONS ==================== */
export type Row2Col = { 
  id: string; 
  pernyataan: string; 
  keterlaksanaan: string; 
  pelaksanaan: string; 
  bukti_pendukung: string 
};

export type RowEval = {
  id: string;
  pernyataan: string;
  keterlaksanaan: string;
  pelaksanaan: string;
  bukti_pendukung: string;
  evaluasi: string;
  tindak_lanjut: string;
  hasil_optimalisasi: string;
};

export type TabData = {
  penetapanA: Row2Col[];
  penetapanB: Row2Col[];
  penetapanC?: Row2Col[];
  penetapanD?: Row2Col[];
  pelaksanaanA: Row2Col[];
  pelaksanaanB: Row2Col[];
  pelaksanaanC?: Row2Col[];
  pelaksanaanD?: Row2Col[];
  pengendalianA?: Row2Col[];
  pengendalianB?: Row2Col[];
  pengendalianC?: Row2Col[];
  pengendalianD?: Row2Col[];
  peningkatanA?: Row2Col[];
  peningkatanB?: Row2Col[];
  peningkatanC?: Row2Col[];
  peningkatanD?: Row2Col[];
  evalRows?: RowEval[];  // Array gabungan untuk backward compatibility
  evalA?: RowEval[];      // Tabel A terpisah
  evalB?: RowEval[];      // Tabel B terpisah
  evalC?: RowEval[];      // Tabel C terpisah
};

/* ==================== GET ALL LED DATA ==================== */
export async function getAllLEDData(user_id: number): Promise<Record<string, TabData>> {
  try {
    const res = await fetch(`${API_BASE_LED}/${user_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      credentials: "include",
    });

    if (!res.ok) {
      console.error('getAllLEDData fetch error, status:', res.status);
      return {};
    }

    return await res.json();
  } catch (error) {
    console.error("Error getAllLEDData:", error);
    return {};
  }
}

/* ==================== SAVE LED TAB ==================== */
export async function saveLEDTab(
  user_id: number,
  tab_key: string,
  data: TabData
): Promise<any> {
  try {
    // Ambil role dari session/local storage jika tersedia
    let role: string | undefined;
    if (typeof window !== 'undefined') {
      try {
        const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
        if (userStr) {
          const userObj = JSON.parse(userStr);
          if (userObj && typeof userObj.role === 'string') {
            role = userObj.role;
          }
        }
      } catch {}
    }
    // Fallback default role jika tidak ditemukan
    if (!role) role = 'TIM_AKREDITASI';

    const res = await fetch(`${API_BASE_LED}/${user_id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subtab: tab_key,
        data,
        role,
      }),
      credentials: "include",
    });

    const text = await res.text();
    let json: any = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      // abaikan, gunakan text mentah
    }

    if (!res.ok) {
      const serverMessage = json?.message || text || 'Unknown error';
      throw new Error(`Gagal menyimpan: ${res.status} ${serverMessage}`);
    }

    return json;
  } catch (error) {
    console.error("Error saveLEDTab:", error);
    throw error;
  }
}

/* ==================== SAVE DRAFT LED ==================== */
export async function saveLEDDraft(payload: { nama?: string; path?: string; status?: string; type: string; currentData: any }): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_LED}/savedraft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    let json: any = null;
    try { json = text ? JSON.parse(text) : null; } catch {}
    if (!res.ok) {
      const msg = json?.message || text || `Failed to save draft (status ${res.status})`;
      throw new Error(msg);
    }
    return json;
  } catch (err) {
    console.error('saveLEDDraft error:', err);
    throw err;
  }
}

/* ==================== SUBMIT LED REVIEW (P4M) ==================== */
export async function submitLEDReview(payload: {
  tab: string;
  status: string;
  notes: string;
  reviewed_user_id: number;
}): Promise<any> {
  try {
    const res = await fetch(`${API_URL}/api/p4m/reviewLED/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    
    const text = await res.text();
    let json: any = null;
    try { json = text ? JSON.parse(text) : null; } catch {}
    
    if (!res.ok) {
      const msg = json?.message || text || `Failed to submit review (status ${res.status})`;
      throw new Error(msg);
    }
    
    return json;
  } catch (err) {
    console.error('submitLEDReview error:', err);
    throw err;
  }
}

/* ==================== GET ALL SUBMITTED LEDs (P4M) ==================== */
export async function getAllSubmittedLEDs(): Promise<any[]> {
  try {
    const res = await fetch(`${API_URL}/api/p4m/reviewLED`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    
    if (!res.ok) {
      console.error('Failed to fetch submitted LEDs, status:', res.status);
      return [];
    }
    
    return await res.json();
  } catch (err) {
    console.error('getAllSubmittedLEDs error:', err);
    return [];
  }
}

/* ==================== GET REVIEW HISTORY (P4M) ==================== */
export async function getReviewHistory(user_id: number): Promise<any[]> {
  try {
    const res = await fetch(`${API_URL}/api/p4m/reviewLED/history/${user_id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    
    if (!res.ok) {
      console.error('Failed to fetch review history, status:', res.status);
      return [];
    }
    
    return await res.json();
  } catch (err) {
    console.error('getReviewHistory error:', err);
    return [];
  }
}

/* ==================== MARK LED AS COMPLETED (P4M) ==================== */
export async function markLEDAsCompleted(buktiPendukungId: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/api/p4m/reviewLED/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ buktiPendukungId })
    });
    
    if (!res.ok) {
      console.error('Failed to mark as completed, status:', res.status);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('markLEDAsCompleted error:', err);
    return false;
  }
}

/* ==================== FETCH ALL LED (Alternative) ==================== */
export const fetchBudayaMutuLED = async (): Promise<any[]> => {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      console.error('No user found');
      return [];
    }
    const res = await fetch(`${API_BASE_LED}/${user.id}`, {
      credentials: "include",
    });
    if (!res.ok) {
      console.error('Fetch error, status:', res.status);
      return [];
    }
    return await res.json();
  } catch (err) {
    console.error('fetchBudayaMutuLED error:', err);
    return [];
  }
};

/* ==================== CREATE LED ==================== */
export const createBudayaMutuLED = async (data: any): Promise<any> => {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      console.error('No user found');
      return null;
    }
    const res = await fetch(`${API_BASE_LED}/${user.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: "include",
    });

    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }

    if (!res.ok) throw new Error(`Create failed: ${res.status} ${text}`);

    return json;
  } catch (err) {
    console.error('createBudayaMutuLED error:', err);
    return null;
  }
};

/* ==================== UPDATE LED ==================== */
export const updateBudayaMutuLED = async (id: string, data: any): Promise<any> => {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      console.error('No user found');
      return null;
    }
    const res = await fetch(`${API_BASE_LED}/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: "include",
    });

    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }

    if (!res.ok) throw new Error(`Update failed: ${res.status} ${text}`);

    return json;
  } catch (err) {
    console.error('updateBudayaMutuLED error:', err);
    return null;
  }
};

/* ==================== DELETE LED ==================== */
export const deleteBudayaMutuLED = async (id: string | number): Promise<any> => {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      console.error('No user found');
      return null;
    }
    const res = await fetch(`${API_BASE_LED}/${user.id}/${id}`, {
      method: 'DELETE',
      credentials: "include",
    });

    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }

    if (!res.ok) throw new Error(`Delete failed: ${res.status} ${text}`);

    return json;
  } catch (err) {
    console.error('deleteBudayaMutuLED error:', err);
    return null;
  }
};

/* ==================== DRAFT FUNCTIONS (LocalStorage) ==================== */
export const saveDraftBudayaMutuLED = (data: any): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('draftBudayaMutuLED', JSON.stringify(data));
  }
};

export const loadDraftBudayaMutuLED = (): any => {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('draftBudayaMutuLED');
    return raw ? JSON.parse(raw) : null;
  }
  return null;
};

export const clearDraftBudayaMutuLED = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('draftBudayaMutuLED');
  }
};

/* ==================== GET LED BY SUBTAB (untuk validasi export) ==================== */
export async function getLEDBySubtab(user_id: number, subtab: string): Promise<{ success: boolean; hasData: boolean; data?: TabData; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_LED}/${user_id}/${subtab}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      credentials: "include",
    });

    if (res.status === 404) {
      return { success: false, hasData: false, message: 'Data LED tidak ditemukan' };
    }

    if (!res.ok) {
      console.error('getLEDBySubtab fetch error, status:', res.status);
      return { success: false, hasData: false, message: 'Gagal mengambil data LED' };
    }

    const result = await res.json();
    return result;
  } catch (error) {
    console.error("Error getLEDBySubtab:", error);
    return { success: false, hasData: false, message: 'Terjadi kesalahan' };
  }
}

/* ==================== VALIDATE LED DATA FOR EXPORT ==================== */
export async function validateLEDForExport(user_id: number, subtabs: string[]): Promise<{ valid: boolean; missing: string[]; found: string[] }> {
  const missing: string[] = [];
  const found: string[] = [];

  for (const subtab of subtabs) {
    const result = await getLEDBySubtab(user_id, subtab);
    if (result.hasData && result.data) {
      found.push(subtab);
    } else {
      missing.push(subtab);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    found
  };
}