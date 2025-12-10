const API_BASE = 'http://localhost:5000/api/diferensiasi-misi';

export interface DataItem {
  id?: number;
  tipe_data?: string;
  unit_kerja?: string;
  konten?: string;
  prodi?: string;
}

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
});


// ========== GET ==========
export const fetchDiferensiasiMisiData = async (prodi?: string) => {
  try {
    let url = `${API_BASE}?subtab=visi-misi`;
    if (prodi) {
      url += `&prodi=${encodeURIComponent(prodi)}`;
    }
    const res = await fetch(url, {
      credentials: "include",
    });

    const json = await res.json();
    return json;
  } catch (err) {
    return { success: false, message: "Gagal fetch data" };
  }
};


// ========== CREATE ==========
export const createDiferensiasiMisiData = async (data: DataItem) => {
  const payload = {
    subtab: "visi-misi",
    data: {
      tipe_data: data.tipe_data,
      unit_kerja: data.unit_kerja,
      konten: data.konten,
    },
  };

  const res = await fetch(API_BASE, {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  return await res.json();
};


// ========== UPDATE ==========
export const updateDiferensiasiMisiData = async (id: number, data: DataItem) => {
  const payload = {
    subtab: "visi-misi",
    data: {
      tipe_data: data.tipe_data,
      unit_kerja: data.unit_kerja,
      konten: data.konten,
    },
  };

  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  return await res.json();
};


// ========== DELETE ==========
export const deleteDiferensiasiMisiData = async (id: number) => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  return await res.json();
};


// ========== SAVE DRAFT ==========
export const saveDiferensiasiMisiDraftToBackend = async (
  nama: string,
  path: string,
  status: string,
  type: string,
  currentData: any
) => {
  const res = await fetch(`${API_BASE}/savedraft`, {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify({ nama, path, status, type, currentData }),
  });

  return await res.json();
};


// ========== IMPORT EXCEL ==========
export const importExcelDiferensiasiMisi = async (
  file: File,
  subtab: string = 'visi-misi'
) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('subtab', subtab);

    const res = await fetch(`${API_BASE}/import`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    const json = await res.json();
    return json;
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Gagal import file Excel',
    };
  }
};
