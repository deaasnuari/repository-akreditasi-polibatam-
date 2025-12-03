// services/matriksPenilaianService.ts

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/matriks-penilaian';

export interface Criterion {
  id: number;
  jenis?: string;        // e.g. "I", "P", "O"
  no_urut?: number;      // No. Urut
  no_butir?: string;     // No. Butir (A, B, 1.1 etc)
  kode?: string;         // kode/label singkat
  kriteria: string;      // Elemen Penilaian LAM
  bobot: number;         // bobot dari 400
  skor_maksimal?: number;
  skorInput: number;     // 1..4
  skorTerbobot: number;  // skorInput * (bobot / 400)
  deskriptor?: string;   // ringkasan
  descriptor_4?: string;
  descriptor_3?: string;
  descriptor_2?: string;
  descriptor_1?: string;
  urutan?: number;
}

export interface Scenario {
  id?: number;
  nama_skenario: string;
  created_at: string;
  jumlah_kriteria: number;
  total_skor: number;
  data?: Criterion[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

class MatriksPenilaianService {
  /**
   * Fetch kriteria penilaian
   */
  async fetchKriteria(): Promise<Criterion[]> {
    try {
      const response = await fetch(`${API_BASE}/kriteria`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<Criterion[]> = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching kriteria:', error);
      throw error;
    }
  }

  /**
   * Fetch skenario yang tersimpan
   */
  async fetchSkenario(): Promise<Scenario[]> {
    try {
      const response = await fetch(`${API_BASE}/skenario`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<Scenario[]> = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching skenario:', error);
      throw error;
    }
  }

  /**
   * Simpan skenario baru
   */
  async saveSkenario(scenario: Omit<Scenario, 'id' | 'created_at'>): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE}/skenario`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scenario),
        credentials: 'include',
      });

      const result: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal menyimpan skenario');
      }

      return result;
    } catch (error) {
      console.error('Error saving skenario:', error);
      throw error;
    }
  }

  /**
   * Update skenario yang sudah ada
   */
  async updateSkenario(id: number, scenario: Partial<Scenario>): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE}/skenario/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scenario),
        credentials: 'include',
      });

      const result: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal mengupdate skenario');
      }

      return result;
    } catch (error) {
      console.error('Error updating skenario:', error);
      throw error;
    }
  }

  /**
   * Hapus skenario
   */
  async deleteSkenario(id: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE}/skenario/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const result: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal menghapus skenario');
      }

      return result;
    } catch (error) {
      console.error('Error deleting skenario:', error);
      throw error;
    }
  }

  /**
   * Simpan skor individual
   */
  async saveScore(data: { prodi_id: number; criteria_item_id: number; skor_prodi: number }): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE}/scores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      const result: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal menyimpan skor');
      }

      return result;
    } catch (error) {
      console.error('Error saving score:', error);
      throw error;
    }
  }

  /**
   * Hitung skor total berdasarkan formula LAM INFOKOM
   */
  calculateTotalScore(criteria: Criterion[]): number {
    return criteria.reduce((sum, c) => sum + (c.skorTerbobot || 0), 0);
  }

  /**
   * Tentukan peringkat akreditasi berdasarkan skor
   */
  getAccreditationGrade(score: number): string {
    if (score >= 3.51) return 'A';
    if (score >= 3.01) return 'B';
    if (score >= 2.01) return 'C';
    return 'Tidak Terakreditasi';
  }

  /**
   * Hitung skor terbobot untuk satu kriteria
   */
  calculateSkorTerbobot(skorInput: number, bobot: number): number {
    // Formula LAM INFOKOM: skor_terbobot = skor_prodi * (bobot / 400)
    return +(skorInput * (bobot / 400)).toFixed(3);
  }

  /**
   * Validasi data kriteria
   */
  validateCriteria(criteria: Criterion[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!criteria || criteria.length === 0) {
      errors.push('Data kriteria tidak boleh kosong');
      return { valid: false, errors };
    }

    criteria.forEach((c, index) => {
      if (!c.kriteria || c.kriteria.trim() === '') {
        errors.push(`Kriteria pada baris ${index + 1} tidak boleh kosong`);
      }
      if (typeof c.bobot !== 'number' || c.bobot < 0) {
        errors.push(`Bobot pada kriteria "${c.kriteria}" harus berupa angka positif`);
      }
      if (c.skorInput && (c.skorInput < 1 || c.skorInput > 4)) {
        errors.push(`Skor input pada kriteria "${c.kriteria}" harus antara 1-4`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Export hasil penilaian ke PDF
   */
  async exportPDF(scenario?: Scenario): Promise<Blob> {
    try {
      const params = scenario ? `?scenario_id=${scenario.id}` : '';
      const response = await fetch(`${API_BASE}/export-pdf${params}`, {
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
   * Export hasil penilaian ke Excel
   */
  async exportExcel(scenario?: Scenario): Promise<Blob> {
    try {
      const params = scenario ? `?scenario_id=${scenario.id}` : '';
      const response = await fetch(`${API_BASE}/export-excel${params}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting Excel:', error);
      throw error;
    }
  }

  /**
   * Download file (untuk export)
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
export const matriksPenilaianService = new MatriksPenilaianService();

export default matriksPenilaianService;
