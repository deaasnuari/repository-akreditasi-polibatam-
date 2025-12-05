const API_BASE = 'http://localhost:5000/api/diferensiasi-misi';

export interface DataItem {
  id?: number;
  tipe_data?: string;
  unit_kerja?: string;
  konten?: string;
  prodi?: string; // Added prodi field
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  return {
    'Content-Type': 'application/json',
  };
};

export const fetchDiferensiasiMisiData = async (prodiFilter: string | null = null) => {
  try {
    let url = `${API_BASE}?subtab=visi-misi`;
    if (prodiFilter) {
      url += `&prodiFilter=${prodiFilter}`;
    }
    const res = await fetch(url, {
      credentials: 'include',
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Fetch failed:', res.status, res.statusText, errorText);
      if (res.status === 401) {
        return { success: false, message: 'Sesi login telah berakhir. Silakan login kembali.' };
      }
      throw new Error(`Gagal fetch data: ${res.status} ${res.statusText}`);
    }
    const json = await res.json();

    const transformedData = (json.data || json || []).map((item: any) => ({
      id: item.id,
      tipe_data: item.data?.tipe_data,
      unit_kerja: item.data?.unit_kerja,
      konten: item.data?.konten,
      prodi: item.prodi, // Corrected to directly access item.prodi
    }));
    return { success: true, data: transformedData };
  } catch (err: any) {
    console.error('Fetch error:', err);
    return { success: false, message: err.message || 'Gagal mengambil data' };
  }
};

export const createDiferensiasiMisiData = async (data: DataItem, prodi: string) => {
  try {
    const payload = {
      subtab: 'visi-misi',
      data: {
        tipe_data: data.tipe_data,
        unit_kerja: data.unit_kerja,
        konten: data.konten,
        prodi: prodi, // Added prodi to payload
      },
    };
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
      credentials: 'include',
    });
    return await res.json();
  } catch (err: any) {
    console.error(err);
    return { success: false, message: 'Gagal menyimpan data' };
  }
};

export const updateDiferensiasiMisiData = async (id: number, data: DataItem, prodi: string) => {
  try {
    const payload = {
      subtab: 'visi-misi',
      data: {
        tipe_data: data.tipe_data,
        unit_kerja: data.unit_kerja,
        konten: data.konten,
        prodi: prodi, // Added prodi to payload
      },
    };
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
      credentials: 'include',
    });
    return await res.json();
  } catch (err: any) {
    console.error(err);
    return { success: false, message: 'Gagal update data' };
  }
};

export const deleteDiferensiasiMisiData = async (id: number) => {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return await res.json();
  } catch (err: any) {
    console.error(err);
    return { success: false, message: 'Gagal menghapus data' };
  }
};

export const importExcelDiferensiasiMisi = async (file: File, mapping: Record<string, string>, prodi: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('subtab', 'visi-misi');
  formData.append('mapping', JSON.stringify(mapping));
  formData.append('prodi', prodi); // Added prodi to formData

  try {
    const res = await fetch(`${API_BASE}/import`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    return await res.json();
  } catch (err: any) {
    console.error(err);
    return { success: false, message: 'Gagal import file' };
  }
};

export const saveDiferensiasiMisiDraftToBackend = async (
  nama: string,
  path: string,
  status: string,
  type: string, // Changed from SubTab to string as it's not defined here
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