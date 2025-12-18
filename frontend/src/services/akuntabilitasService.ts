const API_BASE = 'http://localhost:5000/api/akuntabilitas';

export type SubTab = 'tataKelola' | 'sarana';

// Helper function to get auth headers
const getAuthHeaders = () => {
  return {
    'Content-Type': 'application/json',
  };
};

// =============== API ===============
export const fetchAkuntabilitasData = async (subtab: SubTab, prodi: string | null = null) => {
  try {
    let url = `${API_BASE}?subtab=${subtab}`;
    if (prodi) {
      url += `&prodi=${prodi}`;
    }
    const res = await fetch(url, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const json = await res.json();
    console.log('📥 [Akuntabilitas] Data dari backend:', {
      subtab,
      success: json.success,
      dataCount: json.data?.length || 0,
      sample: json.data?.[0],
      fullData: json.data
    });
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

/**
 * Preview Import Excel
 */
export const previewImportAkuntabilitas = async (file: File, subtab: SubTab): Promise<any> => {
  try {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('subtab', subtab);
    fd.append('preview', 'true');

    const response = await fetch(`${API_BASE}/import/${subtab}`, { method: 'POST', body: fd, credentials: 'include' });
    if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);

    return await response.json();
  } catch (error) {
    console.error('Error previewing import:', error);
    throw error;
  }
};

/**
 * Commit Import Excel
 */
export const commitImportAkuntabilitas = async (file: File, subtab: SubTab, mapping: Record<string, string>): Promise<any> => {
  try {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('subtab', subtab);
    fd.append('mapping', JSON.stringify(mapping));

    const response = await fetch(`${API_BASE}/import/${subtab}`, { method: 'POST', body: fd, credentials: 'include' });
    if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);

    return await response.json();
  } catch (error) {
    console.error('Error committing import:', error);
    throw error;
  }
};

// Legacy function for backward compatibility
export const importExcelAkuntabilitas = async (file: File, subtab: SubTab, mapping: Record<string, string>) => {
  return await commitImportAkuntabilitas(file, subtab, mapping);
};

export const saveAkuntabilitasDraftToBackend = async (
  nama: string,
  path: string,
  status: string,
  type: SubTab,
  currentData: any,
  prodi: string // Add prodi here
) => {
  try {
    console.log('💾 [Akuntabilitas] Menyimpan draft dengan data:', {
      type,
      dataCount: currentData?.length || 0,
      sample: currentData?.[0],
      fullData: currentData
    });
    
    const res = await fetch(`${API_BASE}/savedraft`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ nama, path, status, type, currentData, prodi }), // Include prodi in body
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
