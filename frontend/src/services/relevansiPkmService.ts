// services/relevansiPkmService.ts

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/relevansi-pkm';

export type SubTab =
  | 'sarana-prasarana'
  | 'pkm-hibah'
  | 'kerjasama-pkm'
  | 'diseminasi-pkm'
  | 'hki-pkm';

export interface DataItem {
  id?: number;
  namaprasarana?: string;
  dayatampung?: number;
  luasruang?: number;
  miliksendiri?: string;
  berlisensi?: string;
  perangkat?: string;
  linkbukti?: string;
  namadtpr?: string;
  judulpkm?: string;
  jumlahmahasiswa?: number;
  jenishibah?: string;
  sumberdana?: string;
  durasi?: number;
  pendanaants2?: number;
  pendanaants1?: number;
  pendanaants?: number;
  judulkerjasama?: string;
  mitrakerjasama?: string;
  sumber?: string;
  juduldiseminasi?: string;
  jenisdiseminasi?: string;
  tahunts2?: number;
  tahunts1?: number;
  tahunts?: number;
  judul?: string;
  jenishki?: string;
  [key: string]: any; // for dynamic fields
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

/**
 * Get user_id from localStorage. Only available client-side.
 */
function getUserId() {
  if (typeof window === "undefined") {
    throw new Error("Must be client-side. Wait until browser mounts.");
  }

  const idStr = localStorage.getItem("user_id");
  if (idStr) {
    const id = Number(idStr);
    if (!Number.isNaN(id)) return id;
  }

  const userJson = sessionStorage.getItem("user");
  if (userJson) {
    try {
      const userObj = JSON.parse(userJson);
      if (userObj && typeof userObj.id === 'number') {
        return userObj.id;
      }
      if (userObj && typeof userObj.id === 'string' && !isNaN(Number(userObj.id))) {
        return Number(userObj.id);
      }
    } catch {
      // JSON parsing error - ignore and fallback
    }
  }

  const sessionIdStr = sessionStorage.getItem("user_id");
  if (sessionIdStr) {
    const id = Number(sessionIdStr);
    if (!Number.isNaN(id)) return id;
  }

  throw new Error("User ID not found. Make sure you are logged in.");
}

class RelevansiPkmService {
  /**
   * Fetch data by subtab type
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
   * Add new data
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
        throw new Error(result.message || 'Failed to add data');
      }

      return result;
    } catch (error) {
      console.error('Error creating data:', error);
      throw error;
    }
  }

  /**
   * Update existing data
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
        throw new Error(result.message || 'Failed to update data');
      }

      return result;
    } catch (error) {
      console.error('Error updating data:', error);
      throw error;
    }
  }

  /**
   * Delete data
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
        throw new Error(result.message || 'Failed to delete data');
      }

      return result;
    } catch (error) {
      console.error('Error deleting data:', error);
      throw error;
    }
  }

  /**
   * Import data from Excel
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
        // Content-Type will be automatically set by the browser for FormData
      });

      const result: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to import data');
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
   * Export data to Excel
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
   * Export data to PDF
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
   * Bulk delete - delete multiple data at once
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
        throw new Error(result.message || 'Failed to delete data');
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
   * Validate data before submission
   */
  validateData(data: DataItem, subtab: SubTab): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    switch (subtab) {
      case 'sarana-prasarana':
        if (!data.namaprasarana) errors.push('Nama Prasarana must be filled');
        if (!data.dayatampung || data.dayatampung <= 0) errors.push('Daya Tampung must be greater than 0');
        break;

      case 'pkm-hibah':
        if (!data.namadtpr) errors.push('Nama DTPR must be filled');
        if (!data.judulpkm) errors.push('Judul PKM must be filled');
        break;

      case 'kerjasama-pkm':
        if (!data.judulkerjasama) errors.push('Judul Kerjasama must be filled');
        if (!data.mitrakerjasama) errors.push('Mitra Kerjasama must be filled');
        break;

      case 'diseminasi-pkm':
        if (!data.namadtpr) errors.push('Nama DTPR must be filled');
        if (!data.juduldiseminasi) errors.push('Judul Diseminasi must be filled');
        break;

      case 'hki-pkm':
        if (!data.judul) errors.push('Judul must be filled');
        if (!data.jenishki) errors.push('Jenis HKI must be filled');
        break;
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Download file (for Excel/PDF export)
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
export const relevansiPkmService = new RelevansiPkmService();

export default relevansiPkmService;