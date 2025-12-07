const API_BASE_LKPS = 'http://localhost:5000/api/budaya-mutu';
const API_BASE_LED = 'http://localhost:5000/api/led';

// ==================== 🔹 TYPE ====================
export type SubTab =
  | 'tupoksi'
  | 'pendanaan'
  | 'penggunaan-dana'
  | 'ewmp'
  | 'ktk'
  | 'spmi'
  | 'budaya-mutu'; // tambahan untuk LED

// ===================================================
// ============== 🟦 LKPS SECTION (TIDAK DIUBAH) =====
// ===================================================

export const fetchBudayaMutuData = async (type: SubTab) => {
  try {
    const res = await fetch(`${API_BASE_LKPS}?type=${type}`, {
      credentials: 'include',
    });
    const json = await res.json();
    return json.success ? json.data : [];
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const createBudayaMutuData = async (type: SubTab, data: any) => {
  try {
    const res = await fetch(API_BASE_LKPS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data }),
      credentials: 'include',
    });
    return await res.json();
  } catch (err) {
    console.error(err);
    return { success: false, message: 'Gagal menyimpan data' };
  }
};

export const updateBudayaMutuData = async (id: string, type: SubTab, data: any) => {
  try {
    const res = await fetch(`${API_BASE_LKPS}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data }),
      credentials: 'include',
    });
    return await res.json();
  } catch (err) {
    console.error(err);
    return { success: false, message: 'Gagal update data' };
  }
};

export const deleteBudayaMutuData = async (id: string) => {
  try {
    const res = await fetch(`${API_BASE_LKPS}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return await res.json();
  } catch (err) {
    console.error(err);
    return { success: false, message: 'Gagal menghapus data' };
  }
};

export const importExcelBudayaMutu = async (file: File, type: SubTab) => {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const res = await fetch(`${API_BASE_LKPS}/import/${type}`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    return await res.json();
  } catch (err) {
    console.error(err);
    return { success: false, message: 'Gagal import file' };
  }
};

// ==================== Draft / LocalStorage ====================
export function saveDraftBudayaMutu(subTab: SubTab, data: any[]) {
  try {
    localStorage.setItem(`lkps_${subTab}`, JSON.stringify(data));
  } catch (error) {
    console.error('Gagal menyimpan draft:', error);
  }
}

export function loadDraftBudayaMutu(subTab: SubTab) {
  try {
    const saved = localStorage.getItem(`lkps_${subTab}`);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Gagal memuat draft:', error);
    return [];
  }
}
