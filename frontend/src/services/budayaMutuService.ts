const API_BASE_LKPS = 'http://localhost:5000/api/budaya-mutu-';
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

// ===================================================
// ============== 🟨 LED SECTION (DITAMBAHKAN) =======
// ===================================================

// export const fetchBudayaMutuLED = async () => {
//   try {
//     const res = await fetch(API_BASE_LED);
//     if (!res.ok) {
//       console.error('Fetch error, status:', res.status);
//       return [];
//     }
//     return await res.json();
//   } catch (err) {
//     console.error('fetchBudayaMutuLED error:', err);
//     return [];
//   }
// };

// export const createBudayaMutuLED = async (data: any) => {
//   try {
//     const res = await fetch(API_BASE_LED, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(data),
//     });

//     // baca body sekali saja
//     const text = await res.text();
//     let json;
//     try {
//       json = JSON.parse(text);
//     } catch {
//       json = null;
//     }

//     if (!res.ok) throw new Error(`Create failed: ${res.status} ${text}`);

//     return json;
//   } catch (err) {
//     console.error('createBudayaMutuLED error:', err);
//     return null;
//   }
// };

// export const updateBudayaMutuLED = async (id: string, data: any) => {
//   try {
//     const res = await fetch(`${API_BASE_LED}/${id}`, {
//       method: 'PUT',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(data),
//     });

//     const text = await res.text();
//     let json;
//     try {
//       json = JSON.parse(text);
//     } catch {
//       json = null;
//     }

//     if (!res.ok) throw new Error(`Update failed: ${res.status} ${text}`);

//     return json;
//   } catch (err) {
//     console.error('updateBudayaMutuLED error:', err);
//     return null;
//   }
// };

// export const deleteBudayaMutuLED = async (id: string | number) => {
//   try {
//     const res = await fetch(`${API_BASE_LED}/${id}`, {
//       method: 'DELETE',
//     });

//     const text = await res.text();
//     let json;
//     try {
//       json = JSON.parse(text);
//     } catch {
//       json = null;
//     }

//     if (!res.ok) throw new Error(`Delete failed: ${res.status} ${text}`);

//     return json; // expected { success: true }
//   } catch (err) {
//     console.error('deleteBudayaMutuLED error:', err);
//     return null;
//   }
// };

// // Draft di localStorage
// export const saveDraftBudayaMutuLED = (data: any) => {
//   localStorage.setItem('draftBudayaMutuLED', JSON.stringify(data));
// };

// export const loadDraftBudayaMutuLED = () => {
//   const raw = localStorage.getItem('draftBudayaMutuLED');
//   return raw ? JSON.parse(raw) : null;
// };
