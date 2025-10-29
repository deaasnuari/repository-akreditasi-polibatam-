const API_BASE = 'http://localhost:5000/api/akuntabilitas';

export type SubTab = 'tataKelola' | 'sarana';

// =============== API ===============
export const fetchAkuntabilitasData = async (type: SubTab) => {
  try {
    const res = await fetch(`${API_BASE}?type=${type}`);
    const json = await res.json();
    return json.success ? json.data : [];
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const createAkuntabilitasData = async (type: SubTab, data: any) => {
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data })
    });
    return await res.json();
  } catch (err) {
    console.error(err);
    return { success: false, message: 'Gagal menyimpan data' };
  }
};

export const updateAkuntabilitasData = async (id: string, type: SubTab, data: any) => {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data })
    });
    return await res.json();
  } catch (err) {
    console.error(err);
    return { success: false, message: 'Gagal update data' };
  }
};

export const deleteAkuntabilitasData = async (id: string) => {
  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    return await res.json();
  } catch (err) {
    console.error(err);
    return { success: false, message: 'Gagal menghapus data' };
  }
};

// =============== DRAFT / LOCAL STORAGE ===============
export function saveDraftAkuntabilitas(subTab: SubTab, data: any[]) {
  try {
    localStorage.setItem(`akuntabilitas_${subTab}`, JSON.stringify(data));
  } catch (error) {
    console.error('Gagal menyimpan draft:', error);
  }
}

export function loadDraftAkuntabilitas(subTab: SubTab) {
  try {
    const saved = localStorage.getItem(`akuntabilitas_${subTab}`);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Gagal memuat draft:', error);
    return [];
  }
}
