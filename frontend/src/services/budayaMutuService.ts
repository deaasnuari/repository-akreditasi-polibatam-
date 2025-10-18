// ==================================================
// 📁 services/budayaMutuService.ts
// ==================================================

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// ===============================
// Konstanta & Tipe
// ===============================
const API_BASE = 'http://localhost:5000/api/budaya-mutu';

export type SubTab =
  | 'tupoksi'
  | 'pendanaan'
  | 'penggunaan-dana'
  | 'ewmp'
  | 'ktk'
  | 'spmi';

// ==================================================
// 📦 1. Fetch Data
// ==================================================
export const fetchBudayaMutuData = async (type: SubTab) => {
  try {
    const res = await fetch(`${API_BASE}?type=${type}`);
    const json = await res.json();
    return {
      success: res.ok,
      data: json.data || [],
      message: json.message || '',
    };
  } catch (err) {
    console.error('Fetch error:', err);
    return {
      success: false,
      data: [],
      message: 'Gagal mengambil data',
    };
  }
};
const response = await fetch('/api/budayaMutu');

// ==================================================
// 📤 2. Import Excel
// ==================================================
export const importExcelBudayaMutu = async (file: File, type: SubTab) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch(`${API_BASE}/import/${type}`, {
      method: 'POST',
      body: formData,
    });
    const json = await res.json();
    return {
      success: res.ok && json.success,
      message:
        json.message ||
        (res.ok ? `Import ${type} berhasil` : 'Gagal import file'),
    };
  } catch (err) {
    console.error('Import error:', err);
    return { success: false, message: 'Gagal upload file' };
  }
};

// ==================================================
// ➕ 3. Tambah Data Baru (POST)
// ==================================================
export const createBudayaMutuData = async (data: any, type: SubTab) => {
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, type }),
    });
    const json = await res.json();
    return {
      success: res.ok,
      message:
        json.message ||
        (res.ok ? 'Data berhasil disimpan' : 'Gagal menyimpan data'),
    };
  } catch (err) {
    console.error('Create error:', err);
    return { success: false, message: 'Gagal menyimpan data' };
  }
};

// ==================================================
// ✏️ 4. Update Data (PUT)
// ==================================================
export const updateBudayaMutuData = async (
  id: string,
  data: any,
  type: SubTab
) => {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, type }),
    });
    const json = await res.json();
    return {
      success: res.ok,
      message:
        json.message ||
        (res.ok ? 'Data berhasil diupdate' : 'Gagal mengupdate data'),
    };
  } catch (err) {
    console.error('Update error:', err);
    return { success: false, message: 'Gagal mengupdate data' };
  }
};

// ==================================================
// 🗑️ 5. Hapus Data (DELETE)
// ==================================================
export const deleteBudayaMutuData = async (id: string) => {
  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    const json = await res.json();
    return {
      success: res.ok,
      message:
        json.message ||
        (res.ok ? 'Data berhasil dihapus' : 'Gagal menghapus data'),
    };
  } catch (err) {
    console.error('Delete error:', err);
    return { success: false, message: 'Gagal menghapus data' };
  }
};

// ==================================================
// 🧾 6. Export ke PDF (Gabungan Semua SubTab)
// ==================================================
export async function exportAllBudayaMutuPDF(data: any) {
  const sections = [
    { key: 'tupoksi', title: '3.1 Tupoksi dan Program Mutu' },
    { key: 'pendanaan', title: '3.2 Pendanaan Budaya Mutu' },
    { key: 'penggunaan-dana', title: '3.3 Penggunaan Dana' },
    { key: 'ewmp', title: '3.4 EWMP Dosen' },
    { key: 'ktk', title: '3.5 Kegiatan Budaya Mutu' },
    { key: 'spmi', title: '3.6 SPMI dan Implementasi' },
  ];

  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const margin = 40;
  let y = margin;

  for (const section of sections) {
    const sectionData = data[section.key] || [];

    // Judul Section
    doc.setFontSize(14);
    doc.text(section.title, margin, y);
    y += 10;

    if (sectionData.length === 0) {
      doc.setFontSize(11);
      doc.text('— Tidak ada data —', margin, y + 20);
      y += 40;
      continue;
    }

    const headers = Object.keys(sectionData[0]);
    const rows = sectionData.map((obj: any) => Object.values(obj));

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: y + 15,
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [30, 41, 59] },
      margin: { left: margin, right: margin },
    });

    y = (doc as any).lastAutoTable.finalY + 40;
    if (y > doc.internal.pageSize.height - 100) {
      doc.addPage();
      y = margin;
    }
  }

  doc.save('LKPS_BudayaMutu.pdf');
}

// ==================================================
// 🧾 7. Handle Export (Ambil dari JSON lalu PDF)
// ==================================================
export async function handleExportBudayaMutuPDF() {
  try {
    const response = await fetch('/backend/data/budayaMutu.json');
    if (!response.ok) throw new Error('Gagal memuat data JSON');
    const allData = await response.json();

    await exportAllBudayaMutuPDF(allData);
    return { success: true, message: 'Berhasil ekspor PDF' };
  } catch (error) {
    console.error('❌ Gagal ekspor PDF:', error);
    return { success: false, message: 'Terjadi kesalahan saat ekspor PDF' };
  }
}

// ==================================================
// 💾 8. Save Draft (LocalStorage)
// ==================================================
export function saveDraftBudayaMutu(subTab: string, data: any[]) {
  localStorage.setItem(`lkps_${subTab}`, JSON.stringify(data));
  return { success: true, message: 'Draft berhasil disimpan di localStorage' };
}

// ==================================================
// 📂 9. Load Draft
// ==================================================
export function loadDraftBudayaMutu(subTab: string): any[] {
  const saved = localStorage.getItem(`lkps_${subTab}`);
  return saved ? JSON.parse(saved) : [];
}

// ==================================================
// 📤 10. Submit ke Backend
// ==================================================
export const submitBudayaMutuData = async (type: SubTab) => {
  try {
    const res = await fetch(`${API_BASE}/submit/${type}`, { method: 'POST' });
    const json = await res.json();
    return {
      success: res.ok,
      message: json.message || 'Data berhasil dikirim',
    };
  } catch (err) {
    console.error('Submit error:', err);
    return { success: false, message: 'Gagal mengirim data' };
  }
};
