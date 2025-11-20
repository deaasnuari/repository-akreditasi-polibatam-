// services/relevansiPendidikanService.ts

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/relevansi-pendidikan';

export type SubTab = 
  | 'mahasiswa' 
  | 'keragaman-asal' 
  | 'kondisi-jumlah-mahasiswa' 
  | 'tabel-pembelajaran' 
  | 'pemetaan-CPL-PL' 
  | 'peta-pemenuhan-CPL' 
  | 'rata-rata-masa-tunggu-lulusan' 
  | 'kesesuaian-bidang' 
  | 'kepuasan-pengguna' 
  | 'fleksibilitas' 
  | 'rekognisi-apresiasi';

export interface DataItem {
  id?: number;
  tahun?: string;
  daya_tampung?: number;
  asalMahasiswa?: string;
  ts2?: number;
  ts1?: number;
  ts?: number;
  linkBukti?: string;
  pendaftar?: number;
  diterima?: number;
  aktif?: number;
  asal_daerah?: string;
  jumlah?: number;
  mata_kuliah?: string;
  sks?: number;
  semester?: number;
  profil_lulusan?: string;
  alasan?: string;
  jumlah_lulusan?: number;
  [key: string]: any; // untuk field dinamis seperti pl1, pl2, semester1-8, dll
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

  // Jika tidak ada, coba ambil dari sessionStorage (untuk sementara)
  const sessionIdStr = sessionStorage.getItem("user_id");
  if (sessionIdStr) {
    const id = Number(sessionIdStr);
    if (!Number.isNaN(id)) return id;
  }

  throw new Error("User ID tidak ditemukan. Pastikan sudah login.");
}

class RelevansiPendidikanService {
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
  async createData(data: DataItem, type: SubTab): Promise<ApiResponse> {
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, subtab: type }),
        credentials: 'include',
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
        body: JSON.stringify(data),
        credentials: 'include',
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
  async importExcel(file: File, type: SubTab): Promise<ApiResponse> {
    try {
      const user_id = getUserId();
      const formData = new FormData();
      formData.append('file', file);
      formData.append('subtab', type);
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
   * Export data ke Excel
   */
  async exportExcel(type: SubTab): Promise<Blob> {
    try {
      const response = await fetch(`${API_BASE}/export?type=${type}`, {
        method: 'GET',
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
  async exportPDF(type: SubTab): Promise<Blob> {
    try {
      const response = await fetch(`${API_BASE}/export-pdf?type=${type}`, {
        method: 'GET',
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
  validateData(data: DataItem, type: SubTab): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    switch (type) {
      case 'mahasiswa':
        if (!data.tahun) errors.push('Tahun harus diisi');
        if (!data.daya_tampung || data.daya_tampung <= 0) errors.push('Daya tampung harus lebih dari 0');
        break;
      
      case 'keragaman-asal':
        if (!data.asalMahasiswa) errors.push('Asal mahasiswa harus diisi');
        break;
      
      case 'tabel-pembelajaran':
        if (!data.mata_kuliah) errors.push('Mata kuliah harus diisi');
        if (!data.sks || data.sks <= 0) errors.push('SKS harus lebih dari 0');
        break;
      
      // Tambahkan validasi untuk subtab lainnya sesuai kebutuhan
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
export const relevansiPendidikanService = new RelevansiPendidikanService();

export default relevansiPendidikanService;