// src/services/exportService.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ExportStats {
  totalBagian: number;
  siapExport: number;
  belumLengkap: number;
  kelengkapan: number;
}

interface ExportItem {
  id: number;
  title: string;
  subtitle: string;
  date: string;
}

interface ExportRequest {
  format: string;
  template: string;
  selectedIds: number[];
}

class ExportService {
  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response;
  }

  async getStats(): Promise<ExportStats> {
    try {
      const response = await this.fetchWithAuth(`${API_BASE_URL}/akreditasi/stats`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }

  async getItems(): Promise<ExportItem[]> {
    try {
      const response = await this.fetchWithAuth(`${API_BASE_URL}/akreditasi/items`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching items:', error);
      throw error;
    }
  }

  async exportData(data: ExportRequest): Promise<void> {
    try {
      const response = await this.fetchWithAuth(`${API_BASE_URL}/akreditasi/export`, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const extension = data.format.toLowerCase();
      a.download = `export-akreditasi-${Date.now()}.${extension}`;
      
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  async uploadDocument(file: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('document', file);

      const response = await fetch(`${API_BASE_URL}/akreditasi/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }
}

export const exportService = new ExportService();