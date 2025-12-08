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
  pengendalianA: Row2Col[];
  pengendalianB: Row2Col[];
  pengendalianC?: Row2Col[];
  pengendalianD?: Row2Col[];
  peningkatanA: Row2Col[];
  peningkatanB: Row2Col[];
  peningkatanC?: Row2Col[];
  peningkatanD?: Row2Col[];
  evalRows: RowEval[];
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