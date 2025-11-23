// services/relevansiPenelitianService.ts

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/relevansi-penelitian';

export type SubTab =
  | 'sarana-prasarana'
  | 'hibah-dan-pembiayaan'
  | 'pengembangan-dtpr'
  | 'kerjasama-penelitian'
  | 'publikasi-penelitian'
  | 'perolehan-hki';

export interface DataItem {
  id?: number;
  namaprasarana?: string;
  dayatampung?: number;
  luasruang?: number;
  status?: string;
  lisensi?: string;
  perangkat?: string;
  linkbukti?: string;
  namadtpr?: string;
  judulpenelitian?: string;
  jumlahmahasiswaterlibat?: number;
  jenishibah?: string;
  sumber?: string;
  durasi?: number;
  pendanaan?: number;
  tahun?: number;
  jenispengembangan?: string;
  tahunakademik?: string;
  judulkerjasama?: string;
  mitra?: string;
  judulpublikasi?: string;
  jenispublikasi?: string;
  judul?: string;
  jenishki?: string;
  [key: string]: any; // untuk field dinamis
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

/**
 * Ambil user_id dari localStorage. Hanya bisa di client-side.
 */
function getUserId() {
  if (typeof window === "undefined") {
    throw new Error("Harus di client-side. Tunggu sampai browser mount.");
  }

  // Coba ambil dari localStorage dulu
  const idStr = localStorage.getItem("user_id");
  if (idStr) {
    const id = Number(idStr);
    if (!Number.isNaN(id)) return id;
  }

  // Jika tidak ada, coba ambil dari sessionStorage (mengambil key user yang berisi JSON user)
  const userJson = sessionStorage.getItem("user");
  if (userJson) {
    try {
      const userObj = JSON.parse(userJson);
      if (userObj && typeof userObj.id === 'number') {
        return userObj.id;
      }
      // Also try if id is string number
      if (userObj && typeof userObj.id === 'string' && !isNaN(Number(userObj.id))) {
        return Number(userObj.id);
      }
    } catch {
      // JSON parsing error - ignore and fallback
    }
  }

  // Jika tidak ada, coba ambil dari sessionStorage "user_id" secara khusus masih fallback lama
  const sessionIdStr = sessionStorage.getItem("user_id");
  if (sessionIdStr) {
    const id = Number(sessionIdStr);
    if (!Number.isNaN(id)) return id;
  }

  throw new Error("User ID tidak ditemukan. Pastikan sudah login.");
}

class RelevansiPenelitianService {
  /**
   * Fetch data berdasarkan tipe subtab
   */
  async fetchData(subtab: SubTab): Promise<DataItem[]> {
    try {
      const user_id = getUserId();
      const response = await fetch(`${API_BASE}?subtab=${subtab}&user_id=${user_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<DataItem[]> = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }

  /**
   * Tambah data baru
   */
  async createData(data: DataItem, subtab: SubTab): Promise<ApiResponse> {
    try {
      const user_id = getUserId();

      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ subtab, user_id, ...data }),
      });

      const result: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal menambah data');
      }

      return result;
    } catch (error) {
      console.error('Error creating data:', error);
      throw error;
    }
  }

  /**
   * Update data yang sudah ada
   */
  async updateData(id: number, data: DataItem, subtab: SubTab): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ ...data, subtab }),
      });

      const result: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal mengupdate data');
      }

      return result;
    } catch (error) {
      console.error('Error updating data:', error);
      throw error;
    }
  }

  /**
   * Hapus data
   */
  async deleteData(id: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const result: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal menghapus data');
      }

      return result;
    } catch (error) {
      console.error('Error deleting data:', error);
      throw error;
    }
  }

  /**
   * Import data dari Excel
   */
  async importExcel(file: File, subtab: SubTab): Promise<ApiResponse> {
    try {
      const user_id = getUserId();
      const formData = new FormData();
      formData.append('file', file);
      formData.append('subtab', subtab);
      formData.append('user_id', user_id.toString());

      const response = await fetch(`${API_BASE}/import`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        // Tidak perlu set Content-Type, browser akan set otomatis untuk FormData
      });

      const result: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal import data');
      }

      return result;
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }

  /**
   * Preview Import Excel
   */
  async previewImport(file: File, subtab: SubTab): Promise<any> {
    try {
      const user_id = getUserId();
      const fd = new FormData();
      fd.append('file', file);
      fd.append('subtab', subtab);
      fd.append('user_id', user_id.toString());
      fd.append('preview', 'true');

      const response = await fetch(`${API_BASE}/import`, { method: 'POST', body: fd, credentials: 'include' });
      if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);

      return await response.json();
    } catch (error) {
      console.error('Error previewing import:', error);
      throw error;
    }
  }

  /**
   * Commit Import Excel
   */
  async commitImport(file: File, subtab: SubTab, mapping: Record<string, string>): Promise<any> {
    try {
      const user_id = getUserId();
      const fd = new FormData();
      fd.append('file', file);
      fd.append('subtab', subtab);
      fd.append('user_id', user_id.toString());
      fd.append('mapping', JSON.stringify(mapping));

      const response = await fetch(`${API_BASE}/import`, { method: 'POST', body: fd, credentials: 'include' });
      if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);

      return await response.json();
    } catch (error) {
      console.error('Error committing import:', error);
      throw error;
    }
  }

  /**
   * Export data ke Excel
   */
  async exportExcel(subtab: SubTab): Promise<Blob> {
    try {
      const response = await fetch(`${API_BASE}/export?subtab=${subtab}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  /**
   * Export data ke PDF
   */
  async exportPDF(subtab: SubTab): Promise<Blob> {
    try {
      const response = await fetch(`${API_BASE}/export-pdf?subtab=${subtab}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting PDF:', error);
      throw error;
    }
  }

  /**
   * Bulk delete - hapus multiple data sekaligus
   */
  async bulkDelete(ids: number[]): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE}/bulk-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ ids }),
      });

      const result: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal menghapus data');
      }

      return result;
    } catch (error) {
      console.error('Error bulk deleting:', error);
      throw error;
    }
  }

  /**
   * Get single data by ID
   */
  async getDataById(id: number): Promise<DataItem | null> {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<DataItem> = await response.json();
      return result.data || null;
    } catch (error) {
      console.error('Error fetching data by ID:', error);
      throw error;
    }
  }

  /**
   * Validasi data sebelum submit
   */
  validateData(data: DataItem, subtab: SubTab): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    switch (subtab) {
      case 'sarana-prasarana':
        if (!data.namaprasarana) errors.push('Nama Prasarana harus diisi');
        if (!data.dayatampung || data.dayatampung <= 0) errors.push('Daya Tampung harus lebih dari 0');
        break;

      case 'hibah-dan-pembiayaan':
        if (!data.namadtpr) errors.push('Nama DTPR harus diisi');
        if (!data.judulpenelitian) errors.push('Judul Penelitian harus diisi');
        break;

      case 'pengembangan-dtpr':
        if (!data.namadtpr) errors.push('Nama DTPR harus diisi');
        if (!data.jenispengembangan) errors.push('Jenis Pengembangan harus diisi');
        break;

      case 'kerjasama-penelitian':
        if (!data.judulkerjasama) errors.push('Judul Kerjasama harus diisi');
        if (!data.mitra) errors.push('Mitra harus diisi');
        break;

      case 'publikasi-penelitian':
        if (!data.namadtpr) errors.push('Nama DTPR harus diisi');
        if (!data.judulpublikasi) errors.push('Judul Publikasi harus diisi');
        break;

      case 'perolehan-hki':
        if (!data.judul) errors.push('Judul harus diisi');
        if (!data.jenishki) errors.push('Jenis HKI harus diisi');
        break;
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Download file (untuk export Excel/PDF)
   */
  downloadFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

// Export singleton instance
export const relevansiPenelitianService = new RelevansiPenelitianService();

export default relevansiPenelitianService;
