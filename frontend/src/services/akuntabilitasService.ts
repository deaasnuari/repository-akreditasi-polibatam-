const API_BASE = 'http://localhost:5000/api/akuntabilitas';

export type SubTab = 'tataKelola' | 'sarana';

// Helper function to get auth headers
const getAuthHeaders = () => {
  return {
    'Content-Type': 'application/json',
  };
};

// =============== API ===============
export const fetchAkuntabilitasData = async (subtab: SubTab, prodiFilter: string | null = null) => {
  try {
    let url = `${API_BASE}?subtab=${subtab}`;
    if (prodiFilter) {
      url += `&prodiFilter=${prodiFilter}`;
    }
    const res = await fetch(url, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const json = await res.json();
    return json.success ? json.data : [];
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const fetchDistinctProdi = async () => {
  try {
    const res = await fetch(`${API_BASE}/prodi-options`, {
      credentials: 'include',
    });
    const json = await res.json();
    return json.success ? json.data : [];
  } catch (err) {
    console.error(err);
    return [];
  }
};


export const createAkuntabilitasData = async (subtab: SubTab, data: any, prodi: string) => {
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ subtab, data, prodi }) // Include prodi
    });
    return await res.json();
  } catch (err) {
    console.error(err);
    return { success: false, message: 'Gagal menyimpan data' };
  }
};

export const updateAkuntabilitasData = async (id: string, subtab: SubTab, data: any, prodi: string) => {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ subtab, data, prodi }) // Include subtab and prodi
    });
    return await res.json();
  } catch (err) {
    console.error(err);
    return { success: false, message: 'Gagal update data' };
  }
};

export const deleteAkuntabilitasData = async (id: string) => {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return await res.json();
  } catch (err) {
    console.error(err);
    return { success: false, message: 'Gagal menghapus data' };
  }
};

export const importExcelAkuntabilitas = async (file: File, subtab: SubTab, mapping: Record<string, string>) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('mapping', JSON.stringify(mapping));

  try {
    const res = await fetch(`${API_BASE}/import/${subtab}`, {
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

export const saveAkuntabilitasDraftToBackend = async (
  nama: string,
  path: string,
  status: string,
  type: SubTab,
  currentData: any
) => {
  try {
    const res = await fetch(`${API_BASE}/savedraft`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ nama, path, status, type, currentData }),
    });
    return await res.json();
  } catch (err) {
    console.error(err);
    return { success: false, message: 'Gagal menyimpan draft ke backend' };
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
